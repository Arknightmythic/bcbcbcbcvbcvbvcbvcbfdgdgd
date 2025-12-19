import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import toast from 'react-hot-toast';
import { useAuthActions } from '../../../shared/store/authStore';
import { useSignIn } from '../hooks/useSignIn';
import { useMicrosoftSSO } from '../hooks/useMicrosoftSSO';

const signInSchema = z.object({
  email: z.email('email tidak valid'),
  password: z.string().min(1, 'sandi diperlukan'),
});

type SignInValues = z.infer<typeof signInSchema>;

function Login() {
  const navigate = useNavigate();
  const { login: loginAction } = useAuthActions();
  const { mutate: loginMutation, isPending } = useSignIn();
  const { mutate: microsoftLogin, isPending: isMicrosoftPending } = useMicrosoftSSO();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
  });

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (data: SignInValues) => {
    loginMutation(data, {
      onSuccess: (response) => {
        loginAction(response.data);
        toast.success('Berhasil masuk!');
        navigate('/');
      },
      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.message || 'Autentikasi gagal. Coba lagi.';
        toast.error(errorMessage);
      },
    });
  };

  const handleMicrosoftLogin = () => {
    microsoftLogin();
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col md:flex-row w-full font-sans">
      <div
        className="relative w-full md:w-1/2 hidden md:flex items-center justify-start px-8 md:px-12 lg:px-20 py-10 md:py-16 text-white"
        style={{
          backgroundImage: 'url("/oss-red-bg.jpeg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black opacity-30 z-0" />
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-2xl lg:text-4xl font-extrabold mb-4">
            Selamat Datang Di Layanan
          </h1>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white">
            DokumenAI
          </h2>
        </div>
      </div>

      {/* Panel Kanan (Form) */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16 relative overflow-auto flex-grow">
        {/* Logo */}
        <div className="absolute top-6 right-6 md:top-12 md:right-12 lg:top-16 lg:right-16">
          <img
            src="/LOGO KEMENTERIAN INVESTASI DAN HILIRISASI BKPM-Horizontal.png"
            alt="Logo Kementerian"
            className="h-7 md:h-12"
          />
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 sm:p-10 rounded-xl shadow-lg border border-gray-200 w-full max-w-lg mt-10 lg:mt-32">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            MASUK
          </h2>
          <p className="text-gray-500 mb-8 text-center text-xs">
            Masuk dengan kredensial email Anda.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="silahkan masukan email"
                  className="pl-10 pr-3 py-3 w-full border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm overflow-hidden text-ellipsis"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Sandi
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Silahkan masukkan sandi"
                  className="pl-10 pr-12 py-3 w-full border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm overflow-hidden text-ellipsis"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none z-10"
                  aria-label={showPassword ? 'sembunyikan sandi' : 'memperlihatkan sandi'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center items-center py-3 px-4 rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isPending ? 'sedang autentikasi...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 text-xs">
                  atau masuk dengan
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleMicrosoftLogin}
                disabled={isMicrosoftPending}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-blue-600 rounded-md shadow-sm bg-white font-medium text-gray-700 hover:bg-blue-50 transition-colors duration-200 text-sm"
              >
                <img
                  src="/microsoft-svgrepo-com.svg"
                  alt="Microsoft icon"
                  className="w-5 h-5 mr-2"
                />
                {isMicrosoftPending ? 'mengalihkan...' : 'SSO Microsoft'}
              </button>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          &copy; 2025 DokumenAI. Semua hak cipta dilindungi
        </p>
      </div>
    </div>
  );
}

export default Login;