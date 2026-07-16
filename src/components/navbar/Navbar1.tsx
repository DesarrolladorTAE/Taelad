import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import classNames from "classnames";

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

import logoDark from "../../assets/images/Tae/LOGO-TAE-HORIZONTAL_AZUL.png";
import logoLight from "../../assets/images/Tae/LOGO-TAE-HORIZONTAL_BLANCO.png";

type NavbarProp = {
  classname?: string;
  isLogoDark: boolean;
};

type NavigationItem = {
  path: string;
  title: string;
};

const sectionData: NavigationItem[] = [
  {
    path: "/landing",
    title: "Hogar",
  },
  {
    path: "/facturacion",
    title: "Facturación Electrónica",
  },
  {
    path: "/contabilidad",
    title: "Contabilidad Electrónica",
  },
  {
    path: "/desarrollo",
    title: "Desarrollo Web",
  },
  {
    path: "/diseno",
    title: "Diseño Gráfico",
  },
  {
    path: "/marketing",
    title: "Marketing Digital",
  },
  {
    path: "/blogs",
    title: "Blogs",
  },
];

const Navbar1 = ({
  classname,
  isLogoDark,
}: NavbarProp) => {
  const location = useLocation();

  const [isSticky, setIsSticky] =
    useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY >= 45);
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  const useDarkStyle =
    isLogoDark || isSticky;

  const logoSrc = useDarkStyle
    ? logoDark
    : logoLight;

  const isActiveRoute = (
    routePath: string
  ): boolean => {
    if (routePath === "/blogs") {
      return (
        location.pathname === "/blogs" ||
        location.pathname.startsWith(
          "/blogs/"
        )
      );
    }

    return location.pathname === routePath;
  };

  return (
    <>
      <style>
        {`
          .tae-main-navbar {
            min-height: 78px;
            padding: 8px 0;
            background: transparent;
            transition:
              background-color 0.25s ease,
              box-shadow 0.25s ease,
              padding 0.25s ease;
            z-index: 1050;
          }

          .tae-main-navbar.tae-navbar-solid {
            padding-top: 5px;
            padding-bottom: 5px;
            background:
              rgba(255, 255, 255, 0.98) !important;
            box-shadow:
              0 8px 30px rgba(14, 40, 72, 0.13);
          }

          .tae-navbar-container {
            width: 100%;
            max-width: 100%;
            flex-wrap: nowrap;
          }

          .tae-navbar-brand {
            display: flex;
            flex: 0 0 155px;
            width: 155px;
            max-width: 155px;
            align-items: center;
            margin-right: 12px !important;
          }

          .tae-navbar-brand-link {
            display: block;
            width: 100%;
          }

          .tae-navbar-logo {
            display: block;
            width: 100%;
            max-width: 155px;
            height: 48px;
            object-fit: contain;
            object-position: left center;
          }

          .tae-navbar-collapse {
            min-width: 0;
          }

          .tae-navbar-links {
            min-width: 0;
          }

          .tae-navbar-links .nav-item {
            flex: 0 0 auto;
          }

          .tae-navbar-links .nav-link {
            position: relative;
            padding: 10px 7px !important;
            color:
              rgba(255, 255, 255, 0.92) !important;
            font-size: 12.5px;
            font-weight: 500;
            line-height: 1.2;
            white-space: nowrap;
            transition:
              color 0.2s ease,
              opacity 0.2s ease;
          }

          .tae-navbar-links .nav-link:hover {
            color: #ffffff !important;
          }

          .tae-navbar-links .nav-link::after {
            content: "";
            position: absolute;
            right: 7px;
            bottom: 3px;
            left: 7px;
            height: 2px;
            border-radius: 999px;
            background: #ffffff;
            opacity: 0;
            transform: scaleX(0.5);
            transition:
              opacity 0.2s ease,
              transform 0.2s ease;
          }

          .tae-navbar-links .nav-link.active {
            color: #ffffff !important;
            font-weight: 700;
          }

          .tae-navbar-links .nav-link.active::after {
            opacity: 1;
            transform: scaleX(1);
          }

          .tae-navbar-solid
          .tae-navbar-links
          .nav-link {
            color: #42526a !important;
          }

          .tae-navbar-solid
          .tae-navbar-links
          .nav-link:hover {
            color: #1577ce !important;
          }

          .tae-navbar-solid
          .tae-navbar-links
          .nav-link.active {
            color: #1577ce !important;
          }

          .tae-navbar-solid
          .tae-navbar-links
          .nav-link::after {
            background: #1577ce;
          }

          .tae-navbar-access {
            flex: 0 0 auto;
            margin-left: 8px !important;
          }

          .tae-navbar-login {
            display: inline-flex !important;
            min-width: 120px;
            min-height: 38px;
            align-items: center;
            justify-content: center;
            border: 0 !important;
            border-radius: 999px !important;
            padding: 9px 13px !important;
            color: #ffffff !important;
            background:
              linear-gradient(
                135deg,
                #1577ce,
                #c77b1c
              ) !important;
            box-shadow:
              0 8px 20px
              rgba(21, 119, 206, 0.22);
            font-size: 11px;
            font-weight: 800;
            line-height: 1;
            text-decoration: none;
            white-space: nowrap;
          }

          .tae-navbar-login:hover {
            color: #ffffff !important;
            opacity: 0.94;
            transform: translateY(-1px);
          }

          .tae-navbar-toggle {
            border: 0 !important;
            box-shadow: none !important;
          }

          .tae-navbar-toggle .mdi-menu {
            color: #ffffff;
            font-size: 28px;
          }

          .tae-navbar-solid
          .tae-navbar-toggle
          .mdi-menu {
            color: #23388b;
          }

          @media (min-width: 992px) {
            .tae-navbar-collapse {
              display: flex !important;
              flex: 1 1 auto;
              align-items: center;
            }

            .tae-navbar-links {
              display: flex;
              flex: 1 1 auto;
              flex-direction: row;
              flex-wrap: nowrap;
              align-items: center;
              justify-content: space-evenly;
              margin: 0 !important;
            }
          }

          @media (
            min-width: 992px
          ) and (
            max-width: 1199.98px
          ) {
            .tae-navbar-container {
              padding-right: 10px !important;
              padding-left: 10px !important;
            }

            .tae-navbar-brand {
              flex-basis: 125px;
              width: 125px;
              max-width: 125px;
              margin-right: 5px !important;
            }

            .tae-navbar-logo {
              max-width: 125px;
              height: 41px;
            }

            .tae-navbar-links .nav-link {
              padding-right: 3px !important;
              padding-left: 3px !important;
              font-size: 10px;
            }

            .tae-navbar-access {
              margin-left: 4px !important;
            }

            .tae-navbar-login {
              min-width: 104px;
              padding-right: 8px !important;
              padding-left: 8px !important;
              font-size: 9.5px;
            }
          }

          @media (min-width: 1400px) {
            .tae-navbar-brand {
              flex-basis: 170px;
              width: 170px;
              max-width: 170px;
            }

            .tae-navbar-logo {
              max-width: 170px;
              height: 52px;
            }

            .tae-navbar-links .nav-link {
              padding-right: 10px !important;
              padding-left: 10px !important;
              font-size: 13.5px;
            }

            .tae-navbar-login {
              min-width: 130px;
              font-size: 11.5px;
            }
          }

          @media (max-width: 991.98px) {
            .tae-main-navbar {
              min-height: 70px;
            }

            .tae-navbar-container {
              flex-wrap: wrap;
            }

            .tae-navbar-brand {
              flex-basis: 155px;
              width: 155px;
              max-width: 155px;
              margin-right: auto !important;
            }

            .tae-navbar-logo {
              max-width: 155px;
              height: 46px;
            }

            .tae-navbar-collapse {
              width: 100%;
              margin-top: 8px;
              padding: 12px 16px 16px;
              border-radius: 16px;
              background:
                rgba(255, 255, 255, 0.98);
              box-shadow:
                0 18px 40px
                rgba(20, 50, 82, 0.17);
            }

            .tae-navbar-links {
              width: 100%;
              align-items: stretch;
            }

            .tae-navbar-links .nav-item {
              width: 100%;
            }

            .tae-navbar-links .nav-link {
              width: 100%;
              padding: 10px 4px !important;
              color: #42526a !important;
              font-size: 14px;
              text-align: left;
              white-space: normal;
            }

            .tae-navbar-links .nav-link:hover,
            .tae-navbar-links .nav-link.active {
              color: #1577ce !important;
            }

            .tae-navbar-links .nav-link::after {
              display: none;
            }

            .tae-navbar-access {
              width: 100%;
              margin: 10px 0 0 !important;
            }

            .tae-navbar-login {
              width: 100%;
            }
          }
        `}
      </style>

      <Navbar
        expand="lg"
        fixed="top"
        className={classNames(
          "tae-main-navbar",
          {
            "tae-navbar-solid":
              useDarkStyle,
          },
          classname
        )}
      >
        <Container
          fluid
          className="tae-navbar-container px-3 px-xl-4"
        >
          <Navbar.Brand className="tae-navbar-brand">
            <Link
              to="/landing"
              className="tae-navbar-brand-link"
              aria-label="Ir al inicio"
            >
              <img
                src={logoSrc}
                alt="Tecnologías Administrativas ELAD"
                className="tae-navbar-logo"
              />
            </Link>
          </Navbar.Brand>

          <Navbar.Toggle
            aria-controls="tae-navbar-collapse"
            className="tae-navbar-toggle"
          >
            <i className="mdi mdi-menu" />
          </Navbar.Toggle>

          <Navbar.Collapse
            id="tae-navbar-collapse"
            className="tae-navbar-collapse"
          >
            <Nav
              as="ul"
              className="tae-navbar-links"
            >
              {sectionData.map((section) => {
                const active = isActiveRoute(
                  section.path
                );

                return (
                  <Nav.Item
                    as="li"
                    key={section.path}
                  >
                    <Link
                      to={section.path}
                      className={classNames(
                        "nav-link",
                        {
                          active,
                        }
                      )}
                    >
                      {section.title}
                    </Link>
                  </Nav.Item>
                );
              })}
            </Nav>

            <Nav
              as="ul"
              className="tae-navbar-access"
            >
              <Nav.Item as="li">
                <Link
                  to="/auth/login"
                  className="tae-navbar-login"
                >
                  Ingresa ahora
                </Link>
              </Nav.Item>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default Navbar1;