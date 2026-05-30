// src/pages/Auth.jsx
import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '@/components/auth/AuthHeader.jsx';
import AuthTabs from '@/components/auth/AuthTabs.jsx';
import AuthForm from '@/components/auth/AuthForm.jsx';
import SocialLogin from '@/components/auth/SocialLogin.jsx';
import { loginAPI, signupAPI, getMeAPI } from '@/api/auth.js';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (mode === 'login') {
        const responseData = await loginAPI(email, password);
        const accessToken = responseData.access_token;

        if (!accessToken) {
          throw new Error('로그인 응답에 access_token이 없습니다.');
        }

        const currentUser = await getMeAPI(accessToken);

        setAuth(accessToken, currentUser);

        alert('로그인에 성공했습니다. 대시보드로 이동합니다.');
        navigate('/');
        return;
      }

      if (!agreeTerms) {
        alert('회원가입을 진행하려면 약관에 동의해야 합니다.');
        return;
      }

      await signupAPI(email, password, nickname);

      clearAuth();
      alert('회원가입이 완료되었습니다. 로그인해 주세요.');
      setMode('login');
    } catch (error) {
      console.error('Auth API Error:', error);

      const detail =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message;

      alert(typeof detail === 'string' ? detail : '요청 처리 중 서버 오류가 발생했습니다.');
    }
  };

  return (
    <div className="p-8 bg-slate-50 dark:bg-[#070c19] min-h-screen text-slate-900 dark:text-slate-100 flex justify-center items-center relative overflow-hidden select-none transition-colors duration-300">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full"></div>

      <div className="bg-white dark:bg-[#0b1324] p-8 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-xl dark:shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 w-full max-w-md relative z-10 transition-colors duration-300">
        <AuthHeader />
        <AuthTabs mode={mode} setMode={setMode} />
        <AuthForm
          mode={mode}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          nickname={nickname}
          setNickname={setNickname}
          agreeTerms={agreeTerms}
          setAgreeTerms={setAgreeTerms}
          onSubmit={handleSubmit}
        />
        <SocialLogin />

        <div className="mt-5 flex items-center justify-center gap-1 text-[10px] text-slate-500 dark:text-slate-500 font-medium transition-colors">
          <ShieldAlert className="w-3 h-3 text-slate-400 dark:text-slate-600" />
          End-to-End 가입 데이터 종단간 암호화 아키텍처 적용
        </div>
      </div>
    </div>
  );
}