import { useState } from 'react';
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

export default function AuthForm({
  mode,
  email, setEmail,
  password, setPassword,
  nickname, setNickname,
  agreeTerms, setAgreeTerms,
  onSubmit
}) {
  const [errorMsg, setErrorMsg] = useState('');

  const handleLocalSubmit = (e) => {
    e.preventDefault();
    setErrorMsg(''); // 기존 에러 메시지 초기화

    // 이메일 정규식 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('올바른 형식의 이메일 주소를 입력해 주세요.');
      return;
    }

    // 비밀번호 길이 유효성 검사 (8자 이상)
    if (password.length < 8) {
      setErrorMsg('비밀번호는 최소 8자 이상 입력해야 합니다.');
      return;
    }

    // 회원가입 모드일 경우 닉네임 유효성 검사 (2자 이상)
    if (mode === 'signup' && nickname.trim().length < 2) {
      setErrorMsg('닉네임은 최소 2자 이상 입력해 주세요.');
      return;
    }

    // 모든 유효성 검사를 통과하면 부모 컴포넌트의 onSubmit 실행
    onSubmit(e);
  };

  return (
    <form onSubmit={handleLocalSubmit} className="space-y-4">
      {/* 에러 메시지 알림창 */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl transition-colors duration-300 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* 이메일 입력창 */}
      <div>
        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5 block transition-colors duration-300">보안 계정 이메일 (Email)</label>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute top-3.5 left-4 transition-colors duration-300" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            required
            className="w-full p-3 pl-11 bg-slate-50 dark:bg-[#0d172a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors duration-300"
          />
        </div>
      </div>

      {/* 닉네임 입력창 (회원가입 모드일 때만 활성화) */}
      {mode === 'signup' && (
        <div className="animate-fadeIn">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5 block transition-colors duration-300">사용자 프로필 닉네임 (Nickname)</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute top-3.5 left-4 transition-colors duration-300" />
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="투자자 이름을 입력하세요"
              required={mode === 'signup'}
              className="w-full p-3 pl-11 bg-slate-50 dark:bg-[#0d172a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors duration-300"
            />
          </div>
        </div>
      )}

      {/* 비밀번호 입력창 */}
      <div>
        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5 block transition-colors duration-300">비밀번호 인증 토큰 (Password)</label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute top-3.5 left-4 transition-colors duration-300" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full p-3 pl-11 bg-slate-50 dark:bg-[#0d172a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors duration-300"
          />
        </div>
      </div>

      {/* 이용약관 동의 (회원가입 모드전용) */}
      {mode === 'signup' && (
        <label className="flex items-center gap-2.5 py-1 cursor-pointer select-none text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 transition-colors duration-300 animate-fadeIn">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            required
            className="w-4 h-4 rounded accent-blue-500"
          />
          <span className="text-xs font-medium">개인 자산 정보 암호화 및 서비스 이용약관 동의</span>
        </label>
      )}

      {/* 메인 액션 전송 버튼 */}
      <button
        type="submit"
        className="w-full mt-2 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-blue-600/10 tracking-wider flex items-center justify-center gap-1"
      >
        {mode === 'login' ? '관제 세션 로그인' : '보안 통합 계정 생성'}
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </form>
  );
}