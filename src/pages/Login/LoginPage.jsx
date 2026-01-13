import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden lg:block" style={{ background: '#000f21' }}>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <img
            src="/taskmap_logo.png"
            alt="TaskMap Logo"
            className="max-w-md w-full object-contain"
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <img
              src="/taskmap_icon.png"
              alt="TaskMap Icon"
              className="size-6 object-contain"
            />
            TaskMap
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <div className="flex flex-col items-center mb-6">
              <img
                src="/HRMDD_LOGO.png"
                alt="HRMDD Logo"
                className="w-48 object-contain"
              />
            </div>
            <LoginForm />
          </div>
        </div>
      </div>

    </div>
  )
}
