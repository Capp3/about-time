import "./Main.css";
import { NavBar } from "./components/NavBar";
import { Outlet } from "react-router";

export default function App() {
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
}
