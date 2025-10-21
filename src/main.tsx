import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router";
import Router from "./Router";

const queryCLient = new QueryClient();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryCLient}>
      <Toaster position="top-center" />
      <RouterProvider router={Router} />
    </QueryClientProvider>
  </StrictMode>
);
