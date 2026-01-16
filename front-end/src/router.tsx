import { createBrowserRouter } from "react-router-dom"
import RootLayout from "./layouts/RootLayout"
import CreateLinkPage from "./pages/CreateLinkPage"
import ShareLinkPage from "./pages/ShareLinkPage"
import PayPage from "./pages/PayPage"
import ReceiptPage from "./pages/ReceiptPage"
import NotFoundPage from "./pages/NotFoundPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <CreateLinkPage />,
      },
      {
        path: "share/:id",
        element: <ShareLinkPage />,
      },
      {
        path: "pay/:id",
        element: <PayPage />,
      },
      {
        path: "receipt/:id",
        element: <ReceiptPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
])
