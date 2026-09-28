import { ChevronDown, FingerprintPattern, LogOut } from "lucide-react";
import { Formatting } from "../utils/formatting";
import { Popover } from "react-tiny-popover";
import { useEffect, useState } from "react";
import profileStore from "../store/profileStore";
import loadingStore from "../store/loadingStore";
import { useNavigate } from "react-router";
import { getProfile } from "../api/auth";
import { toast } from "react-toastify";

export default function NavBar() {
  const setLoading = loadingStore((state) => state.setLoading);
  const navigate = useNavigate();
  const setProfile = profileStore((state) => state.setProfile);
  const profile = profileStore((state) => state.profile);
  const [openPopOver, setOpenPopOver] = useState<boolean>(false);

  const onLogout = () => {
    setLoading(true);
    Formatting.deleteAllToken();
    navigate("/");
  };

  useEffect(() => {
    if (Formatting.getToken(import.meta.env.VITE_PUBLIC_KEY_TOKEN)) {
      setLoading(true);
      getProfile()
        .then((res) => {
          setProfile(res.data.data);
          setLoading(false);
        })
        .catch((err) => {
          toast.error(err.message.toString() || "Something went wrong");
          setLoading(false);
        });
    } else {
      navigate("/");
    }
  }, []);

  return (
    <div className="bg-text-title border-b border-white flex justify-center sticky top-0 w-full">
      <div className="max-w-full md:max-w-7xl justify-between px-4 flex w-full h-14">
        <div className="flex gap-3 items-center">
          <div className="size-7 bg-primary rounded-lg flex items-center justify-center">
            <FingerprintPattern className="size-4 text-white" />
          </div>
          <p className="text-text-white">{profile.user.role === "ADMIN" ? "Attendance Overview" : "My Attendance"}</p>
        </div>

        <Popover
          isOpen={openPopOver}
          positions={"bottom"}
          align="end"
          reposition={true}
          onClickOutside={() => setOpenPopOver(false)}
          containerStyle={{ zIndex: "30", marginTop: "-4px" }}
          clickOutsideCapture
          content={
            <div className="rounded-xl border py-1 bg-white border-bg-card">
              <div className="border-b border-border py-2 px-3">
                <p className="font-medium text-xs text-text-title">{profile.user.name}</p>
                <p className="text-xs text-placeholder">{profile.user.role}</p>
              </div>
              <button className="py-2 px-3 flex gap-2 text-text-danger items-center cursor-pointer" onClick={onLogout}>
                <LogOut className="size-4" />
                <p className="text-sm">Sign Out</p>
              </button>
            </div>
          }
        >
          <div className="flex gap-2.5 items-center px-2.5 cursor-pointer" onClick={() => setOpenPopOver(true)}>
            <p className="font-semibold text-xs text-white">{Formatting.profileName(profile.user.name)}</p>
            <div className="hidden md:flex md:flex-col">
              <p className="text-xs text-white font-medium">{profile.user.name}</p>
              <p className="text-xs text-placeholder">{profile.user.role}</p>
            </div>
            <ChevronDown className="size-4 text-placeholder" />
          </div>
        </Popover>
      </div>
    </div>
  );
}
