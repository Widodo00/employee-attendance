import { useEffect, useState } from "react";
import type { errorFormLoginInterface } from "../../types/login";
import { FingerprintPattern, LockKeyhole, Mail } from "lucide-react";
import type { fieldsInputInterface } from "../../types/general";
import loadingStore from "../../store/loadingStore";
import { postLogin } from "../../api/auth";
import { toast } from "react-toastify";
import InputCustom from "../../component/inputCustom";
import { Formatting } from "../../utils/formatting";
import { useNavigate } from "react-router";
import profileStore from "../../store/profileStore";
import { loginSchema, type formLoginInterface } from "../../validation/login";

export default function Login() {
  const setLoading = loadingStore((state) => state.setLoading);
  const setProfile = profileStore((state) => state.setProfile);
  const loading = loadingStore((state) => state.loading);
  const navigate = useNavigate();
  const [isErrorPass, setIsErrorPass] = useState<boolean>(false);
  const [form, setForm] = useState<formLoginInterface>({
    email: "",
    password: "",
  });

  const [errorForm, setErrorForm] = useState<errorFormLoginInterface>({
    email: "",
    password: "",
  });

  const formField: fieldsInputInterface[] = [
    { label: "Email", name: "email", type: "text", placeholder: "your@mail.com", Icon: Mail },
    { label: "Password", name: "password", type: "password", placeholder: "Enter your password", Icon: LockKeyhole },
  ];

  const handleOnChange = (value: string, name: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errorForm[name as keyof formLoginInterface]) {
      setErrorForm((prev) => ({ ...prev, [name]: "" }));
    }
    if (isErrorPass) {
      setIsErrorPass(false);
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validate = loginSchema.safeParse(form);

    if (!validate.success) {
      const errors = validate.error.flatten().fieldErrors;

      setErrorForm({
        email: errors.email?.[0] ?? "",
        password: errors.password?.[0] ?? "",
      });

      return;
    }

    setLoading(true);
    postLogin(form)
      .then((res) => {
        Formatting.saveToken(res.data.accessToken);
        navigate("/dashboard");
        setLoading(false);
      })
      .catch((err) => {
        if (err.message.includes("Invalid")) {
          setIsErrorPass(true);
          setErrorForm((prev) => ({ ...prev, password: "Invalid email or password" }));
        } else {
          toast.error(err.message.toString() || "Something wrong");
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    if (Formatting.getToken(import.meta.env.VITE_PUBLIC_KEY_TOKEN)) {
      navigate("/dashboard");
    } else {
      setLoading(false);
      setProfile({
        serverTime: "",
        user: {
          email: "",
          name: "",
          role: "",
        },
      });
    }
  }, []);

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
          <div className="flex flex-col gap-4">
            {formField.map((item) => (
              <InputCustom
                key={item.name}
                label={item.label}
                name={item.name}
                placeholder={item.placeholder}
                value={form[item.name as keyof formLoginInterface]}
                onChange={(value) => handleOnChange(value, item.name)}
                type={item.type}
                Icon={item.Icon}
                errorText={errorForm[item.name as keyof formLoginInterface]}
                isError={Boolean(errorForm[item.name as keyof formLoginInterface]) || isErrorPass}
              />
            ))}
          </div>
          <button type="submit" className="btn-primary" disabled={Boolean(errorForm.email) || Boolean(errorForm.password) || !form.email || !form.password || loading}>
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
