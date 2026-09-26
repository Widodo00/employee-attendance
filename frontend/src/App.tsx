import { Suspense } from "react";
import { ToastContainer, Slide } from "react-toastify";
import Loading from "./component/loading";
import { router } from "./router";
import { RouterProvider } from "react-router";

export default function App() {
  return (
    <>
      <ToastContainer theme="light" position="top-right" autoClose={5000} transition={Slide} />
      <Suspense fallback={<Loading />}>
        <RouterProvider router={router} />
      </Suspense>
    </>
  );
}
