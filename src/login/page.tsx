import { useState } from "react";
import type { errorFormLoginInterface, formLoginInterface } from "../types/login";
import { FingerprintPattern, LockKeyhole, Mail } from "lucide-react";
import InputGroup from "../component/inputGroup";
import type { fieldsInputInterface } from "../types/general";

export default function Login() {
  const [form, setForm] = useState<formLoginInterface>({
    email: "",
    password: "",
  });

  const [errorForm, setErrorForm] = useState<errorFormLoginInterface>({
    email: "",
    password: "",
  });

  const formField: fieldsInputInterface[] = [
    { label: "Username", name: "email", type: "text", placeholder: "your@mail.com", Icon: Mail },
    { label: "Password", name: "password", type: "password", placeholder: "Enter your password", Icon: LockKeyhole },
  ];

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.email.includes("@") || !form.email.includes(".")) {
      setErrorForm((prev) => ({ ...prev, email: "Invalid email" }));
    }
  };

  return (
    <div className="w-full h-dvh flex justify-center items-center">
      <div className="bg-white border border-border rounded-xl p-6 flex flex-col gap-8 md:w-[384px]">
        <div className="flex gap-2 items-center">
          <div className="size-8 bg-text-title flex items-center justify-center rounded-lg">
            <FingerprintPattern className="size-4.5 text-white" />
          </div>
          <p className="font-semibold text-text-title">Attendance</p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="font-bold text-2xl text-text-title">Welcome back</p>
          <p className="text-text-caption text-sm">Manage your daily attendance easily.</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <InputGroup
            fields={formField}
            formData={form}
            onChange={(value: string, name: string) => {
              setForm((prev) => ({ ...prev, [name]: value }));
              setErrorForm((prev) => ({ ...prev, [name]: "" }));
            }}
            errorForm={errorForm}
          />
          <button type="submit" className="btn-primary" disabled={Boolean(errorForm.email) || Boolean(errorForm.password) || !form.email || !form.password}>
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
