import { Suspense } from "react";
import { ToastContainer, Slide } from "react-toastify";
import Loading from "./component/loading";
import { router } from "./router";
import { RouterProvider } from "react-router";
import loadingStore from "./store/loadingStore";

export default function App() {
  const loading = loadingStore((state) => state.loading);
  return (
    <>
      {loading && <Loading />}
      <ToastContainer theme="light" position="top-right" autoClose={5000} transition={Slide} />
      <Suspense fallback={<Loading />}>
        <RouterProvider router={router} />
      </Suspense>
    </>
  );
}
