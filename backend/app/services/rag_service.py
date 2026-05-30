import hashlib
import math
from typing import Any

import google.generativeai as genai
import pandas as pd
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from app.core.config import settings
from app.schemas.analysis import RagAnalysisResponse, SourceArticle
from app.services.scraper_service import load_raw_news


def _get_api_key() -> str | None:
    return settings.active_gemini_api_key


def _make_doc_id(url: str, title: str) -> str:
    raw = f"{url}|{title}".encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def _safe_text(value: Any, default: str = "") -> str:
    if value is None:
        return default

    if isinstance(value, float) and math.isnan(value):
        return default

    text = str(value).strip()

    if not text or text.lower() == "nan":
        return default

    return text


def _split_content_to_factors(content: str, max_items: int = 5) -> list[str]:
    if not content:
        return []

    factors: list[str] = []

    for raw_line in content.splitlines():
        line = raw_line.strip()

        if not line:
            continue

        cleaned = (
            line.replace("#", "")
            .replace("*", "")
            .replace("-", "")
            .strip()
        )

        if len(cleaned) < 8:
            continue

        factors.append(cleaned)

    return factors[:max_items]


def _calculate_confidence_score(
    retrieved_count: int,
    has_model_answer: bool,
) -> int:
    if retrieved_count <= 0:
        return 45

    score = 60 + min(retrieved_count, 10) * 3

    if has_model_answer:
        score += 7

    return max(45, min(95, score))


def _doc_to_source_article(
    doc: Document,
    index: int,
    score: float | None = None,
) -> SourceArticle:
    metadata = doc.metadata or {}

    title = _safe_text(
        metadata.get("title"),
        default=f"뉴스 문맥 {index}",
    )

    url = _safe_text(
        metadata.get("url"),
        default=None,
    )

    source = _safe_text(
        metadata.get("source"),
        default="Unknown",
    )

    published_at = _safe_text(
        metadata.get("published_at"),
        default=None,
    )

    article_id = _make_doc_id(
        url=url or f"doc-{index}",
        title=title,
    )

    return SourceArticle(
        id=article_id,
        title=title,
        url=url,
        media=source,
        source=source,
        published_at=published_at,
        score=score,
    )


def _row_to_source_article(
    row: pd.Series,
    index: int,
) -> SourceArticle:
    title = _safe_text(
        row.get("title"),
        default=f"뉴스 {index}",
    )

    url = _safe_text(
        row.get("url"),
        default=None,
    )

    source = _safe_text(
        row.get("source"),
        default="Unknown",
    )

    published_at = _safe_text(
        row.get("published_at"),
        default=None,
    )

    article_id = _make_doc_id(
        url=url or f"row-{index}",
        title=title,
    )

    return SourceArticle(
        id=article_id,
        title=title,
        url=url,
        media=source,
        source=source,
        published_at=published_at,
        score=None,
    )


class NewsRagService:
    def __init__(self) -> None:
        self.api_key = _get_api_key()
        self.embeddings = None
        self.vector_db = None
        self.model = None

        if not self.api_key:
            return

        try:
            self.embeddings = GoogleGenerativeAIEmbeddings(
                model=settings.GEMINI_EMBEDDING_MODEL,
                google_api_key=self.api_key,
            )

            self.vector_db = Chroma(
                collection_name=settings.VECTOR_DB_COLLECTION,
                embedding_function=self.embeddings,
                persist_directory=settings.VECTOR_DB_PATH,
            )

            genai.configure(api_key=self.api_key)

            self.model = genai.GenerativeModel(
                model_name=settings.GEMINI_RAG_MODEL,
            )

        except Exception:
            self.embeddings = None
            self.vector_db = None
            self.model = None

    def add_news_to_vector_db(self, news_df: pd.DataFrame) -> int:
        if self.vector_db is None:
            return 0

        if news_df is None or news_df.empty:
            return 0

        if "context_text" not in news_df.columns:
            return 0

        clean_df = news_df.dropna(subset=["context_text"]).copy()
        clean_df["context_text"] = clean_df["context_text"].astype(str).str.strip()
        clean_df = clean_df[clean_df["context_text"].str.len() > 20]

        documents: list[Document] = []
        ids: list[str] = []

        for _, row in clean_df.iterrows():
            title = _safe_text(
                row.get("title"),
                default="No Title",
            )

            url = _safe_text(
                row.get("url"),
                default="",
            )

            source = _safe_text(
                row.get("source"),
                default="Unknown",
            )

            published_at = _safe_text(
                row.get("published_at"),
                default="",
            )

            doc = Document(
                page_content=_safe_text(row.get("context_text")),
                metadata={
                    "title": title,
                    "source": source,
                    "published_at": published_at,
                    "url": url,
                },
            )

            documents.append(doc)
            ids.append(
                _make_doc_id(
                    url=url,
                    title=title,
                )
            )

        if not documents:
            return 0

        added_count = 0

        for doc, doc_id in zip(documents, ids):
            try:
                self.vector_db.add_documents(
                    documents=[doc],
                    ids=[doc_id],
                )
                added_count += 1
            except Exception:
                continue

        return added_count

    def _fallback_search_from_csv(
        self,
        topic: str,
        limit: int = 10,
    ) -> tuple[list[Document], list[SourceArticle]]:
        news_df = load_raw_news()

        if news_df is None or news_df.empty:
            return [], []

        working_df = news_df.copy()

        if "context_text" not in working_df.columns:
            working_df["context_text"] = working_df["title"].astype(str)

        keywords = [
            keyword.lower()
            for keyword in topic.replace(",", " ").split()
            if len(keyword.strip()) >= 2
        ]

        def score_row(row: pd.Series) -> int:
            text = " ".join(
                [
                    _safe_text(row.get("title")),
                    _safe_text(row.get("context_text")),
                    _safe_text(row.get("source")),
                ]
            ).lower()

            return sum(1 for keyword in keywords if keyword in text)

        working_df["_match_score"] = working_df.apply(score_row, axis=1)

        sort_columns = ["_match_score"]

        if "published_at" in working_df.columns:
            sort_columns.append("published_at")

        working_df = working_df.sort_values(
            by=sort_columns,
            ascending=False,
        )

        selected_df = working_df.head(limit)

        docs: list[Document] = []
        articles: list[SourceArticle] = []

        for index, (_, row) in enumerate(selected_df.iterrows(), start=1):
            title = _safe_text(
                row.get("title"),
                default=f"뉴스 {index}",
            )

            context_text = _safe_text(
                row.get("context_text"),
                default=title,
            )

            source = _safe_text(
                row.get("source"),
                default="Unknown",
            )

            published_at = _safe_text(
                row.get("published_at"),
                default="",
            )

            url = _safe_text(
                row.get("url"),
                default="",
            )

            doc = Document(
                page_content=context_text,
                metadata={
                    "title": title,
                    "source": source,
                    "published_at": published_at,
                    "url": url,
                },
            )

            docs.append(doc)
            articles.append(
                _row_to_source_article(
                    row=row,
                    index=index,
                )
            )

        return docs, articles

    def search_relevant_news(
        self,
        topic: str,
        limit: int = 10,
    ) -> tuple[list[Document], list[SourceArticle]]:
        query = (
            f"{topic} macro economy inflation interest rate "
            f"bond yield dollar gold copper oil supply chain market impact"
        )

        if self.vector_db is not None:
            try:
                docs_with_scores = self.vector_db.similarity_search_with_relevance_scores(
                    query,
                    k=limit,
                )

                docs: list[Document] = []
                articles: list[SourceArticle] = []

                for index, item in enumerate(docs_with_scores, start=1):
                    doc, score = item

                    docs.append(doc)
                    articles.append(
                        _doc_to_source_article(
                            doc=doc,
                            index=index,
                            score=float(score) if score is not None else None,
                        )
                    )

                if docs:
                    return docs, articles

            except Exception:
                pass

            try:
                docs = self.vector_db.similarity_search(
                    query,
                    k=limit,
                )

                articles = [
                    _doc_to_source_article(
                        doc=doc,
                        index=index,
                    )
                    for index, doc in enumerate(docs, start=1)
                ]

                if docs:
                    return docs, articles

            except Exception:
                pass

        return self._fallback_search_from_csv(
            topic=topic,
            limit=limit,
        )

    def generate_rag_analysis(
        self,
        topic: str,
        index_score: float | None = None,
    ) -> RagAnalysisResponse:
        retrieved_docs, source_articles = self.search_relevant_news(
            topic=topic,
            limit=10,
        )

        if not retrieved_docs:
            content = (
                f"{topic} 관련 뉴스 벡터 데이터가 부족합니다. "
                "먼저 화면의 [뉴스 데이터 갱신] 버튼을 눌러 주세요."
            )

            return RagAnalysisResponse(
                topic=topic,
                index_score=index_score,
                retrieved_count=0,
                content=content,
                factors=[content],
                confidence_score=45,
                source_articles=[],
            )

        context = "\n".join(
            [
                (
                    f"[{index}] "
                    f"{_safe_text(doc.metadata.get('published_at'))} "
                    f"{_safe_text(doc.metadata.get('source'))} - "
                    f"{_safe_text(doc.metadata.get('title'))}\n"
                    f"{doc.page_content}"
                )
                for index, doc in enumerate(retrieved_docs, start=1)
            ]
        )

        index_text = (
            f"{index_score:.4f}"
            if index_score is not None
            else "계산된 지수 없음"
        )

        fallback_content = f"""
# 1. 핵심 요약
{topic}에 대한 관련 뉴스 문맥 {len(retrieved_docs)}개를 검색했습니다. 현재 MarketEcho Index는 {index_text}입니다.

# 2. 뉴스 문맥 기반 해석
검색된 뉴스는 금리, 원자재, 달러, 경기 기대, 정책 방향성 중 하나 이상의 변수와 연결됩니다.

# 3. MarketEcho Index 방향성
지수가 양수라면 긴축, 인플레이션, 원자재 강세, 위험선호 또는 비용 압력의 성격을 확인해야 합니다. 지수가 음수라면 위험회피, 경기 둔화, 완화 기대 가능성을 함께 봐야 합니다.

# 4. 관련 산업과 자산군 영향
금리 민감 성장주, 반도체, 금융, 에너지, 원자재, 방어주가 서로 다른 방향으로 영향을 받을 수 있습니다.

# 5. 다음에 확인할 지표
미국 10년물 국채금리, 달러 인덱스, 금 가격, 구리 가격, WTI 유가, CPI, 고용지표를 함께 확인하는 것이 좋습니다.
""".strip()

        content = fallback_content
        has_model_answer = False

        if self.model is not None:
            prompt = f"""
당신은 글로벌 매크로 투자 전략가입니다.

[분석 주제]
{topic}

[현재 MarketEcho Index]
{index_text}

[검색된 뉴스 문맥]
{context}

아래 형식으로 한국어 분석을 작성하세요.

# 1. 핵심 요약
- 3~5줄로 요약하세요.

# 2. 뉴스 문맥 기반 해석
- 검색된 뉴스들이 어떤 인과관계로 연결되는지 설명하세요.

# 3. MarketEcho Index가 의미하는 방향성
- 지수가 양수 또는 음수일 때의 의미를 현재 문맥에 맞게 설명하세요.

# 4. 관련 산업과 자산군에 대한 영향
- 기술주, 금융, 에너지, 원자재, 방어주, 채권, 달러, 금 중 관련 있는 항목을 설명하세요.

# 5. 다음에 확인할 지표
- 사용자가 추가로 봐야 할 지표를 5개 이내로 정리하세요.

주의:
- 매수/매도 추천을 단정하지 마세요.
- 투자 조언이 아니라 분석 참고자료로 작성하세요.
- 과도한 확정 표현을 피하고 가능성 중심으로 설명하세요.
- 존댓말로 작성하세요.
""".strip()

            try:
                response = self.model.generate_content(prompt)
                model_text = getattr(response, "text", None)

                if model_text:
                    content = model_text.strip()
                    has_model_answer = True

            except Exception as exc:
                content = (
                    f"{fallback_content}\n\n"
                    f"참고: Gemini 분석 생성 중 오류가 발생했습니다. {exc}"
                )

        confidence_score = _calculate_confidence_score(
            retrieved_count=len(retrieved_docs),
            has_model_answer=has_model_answer,
        )

        factors = _split_content_to_factors(
            content=content,
            max_items=5,
        )

        return RagAnalysisResponse(
            topic=topic,
            index_score=index_score,
            retrieved_count=len(retrieved_docs),
            content=content,
            factors=factors,
            confidence_score=confidence_score,
            source_articles=source_articles,
        )