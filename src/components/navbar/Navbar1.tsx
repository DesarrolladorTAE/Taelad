import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { Nav } from "react-bootstrap";
import { HashLink } from "react-router-hash-link";

// images
import logoDark from "../../assets/images/Tae/LOGO-TAE-HORIZONTAL_AZUL.png";
import logoLight from "../../assets/images/Tae/LOGO-TAE-HORIZONTAL_BLANCO.png";

import Container from "react-bootstrap/esm/Container";
import NavbarCollapse from "react-bootstrap/esm/NavbarCollapse";
import Navbar from "react-bootstrap/Navbar";

type NavbarProp = {
  classname?: string; isLogoDark: boolean;
};

const sectionData = [
  { path: "/landing", title: "Hogar" },
  { path: "/facturacion", title: "Facturación Electrónica" },
  { path: "/contabilidad", title: "Contabilidad Electrónica" },
  { path: "/desarrollo", title: "Desarrollo Web" },
  { path: "/diseno", title: "Diseño Gráfico" },
  { path: "/marketing", title: "Marketing Digital" },
];

/** Colores TAE */
const brandBlue   = "#1577CE";
const brandOrange = "#C77B1C";
const brandBlack  = "#0B0B0B";
const brandWhite  = "#FFFFFF";

const Navbar1 = ({ classname, isLogoDark }: NavbarProp) => {
  const [activeSection, setActiveSection] = useState<string>("hogar");
  const navbar = useRef<HTMLDivElement>(null);
  const path = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const navbar1 = navbar.current;
      if (navbar1 != null) {
        if (classname) {
          navbar1.classList.add(classname);
        }
        if (document.body.scrollTop >= 50 || document.documentElement.scrollTop >= 50) {
          navbar1.classList.add("nav-sticky");
        } else {
          navbar1.classList.remove("nav-sticky");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [classname]);

  return (
    <>
      <Nav
        className={classNames("navbar navbar-expand-lg fixed-top navbar-custom sticky-dark m-0", classname)}
        ref={navbar}
        id="navbar-sticky"
      >
        <Container>
          <Navbar.Brand>
            <Link
              className="logo text-uppercase"
              to="/"
              onClick={(e) => {
                if (path.pathname === "/landing") {
                  e.preventDefault();
                }
              }}
            >
              {isLogoDark ? (
                <img src={logoDark} alt="" className="logo-dark" />
              ) : (
                <>
                  <img src={logoDark} alt="" className="logo-dark" style={{ height: 55, width: "auto" }} />
                  <img src={logoLight} alt="" className="logo-light" style={{ height: 55, width: "auto" }} />
                </>
              )}
            </Link>
          </Navbar.Brand>

          <Navbar.Toggle
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
            aria-controls="navbarCollapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <i className="mdi mdi-menu"></i>
          </Navbar.Toggle>

          <NavbarCollapse id="navbarCollapse">
            {/* Centro: links de navegación */}
            <Nav className="navbar-nav mx-auto navbar-center" id="mySidenav">
              {sectionData.map((section) => (
                <Nav.Item as="li" key={section.path}>
                  <Link
                    to={section.path}
                    className={classNames("nav-link", path.pathname === section.path ? "active" : "")}
                    onClick={(e) => {
                      if (path.pathname === section.path) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {section.title}
                  </Link>
                </Nav.Item>
              ))}
            </Nav>

            {/* Derecha: botón Ingresa ahora */}
            <Nav as="ul" className="navbar-nav ms-lg-3">
              <Nav.Item as="li" className="my-2 my-lg-0">
                <Link
                  to="/auth/login"
                  className="btn"
                  style={{
                    fontWeight: 700,
                    borderRadius: 999,
                    padding: "10px 18px",
                    color: brandWhite,
                    backgroundImage: `linear-gradient(135deg, ${brandBlue}, ${brandOrange})`,
                    boxShadow: "0 8px 20px rgba(21,119,206,.22)",
                    border: "none",
                    display: "inline-block",
                    lineHeight: 1.1,
                  }}
                >
                  Ingresa ahora
                </Link>
              </Nav.Item>
            </Nav>
          </NavbarCollapse>
        </Container>
      </Nav>
    </>
  );
};

export default Navbar1;
