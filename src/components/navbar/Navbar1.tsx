import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { Nav } from "react-bootstrap";
import { HashLink } from "react-router-hash-link";

// images
// import logoDark from "../../assets/images/logo-dark.png";
// import logoLight from "../../assets/images/logo-light.png";

import logoDark from "../../assets/images/Tae/LOGO-TAE-HORIZONTAL_AZUL.png";
import logoLight from "../../assets/images/Tae/LOGO-TAE-HORIZONTAL_BLANCO.png";

import Container from "react-bootstrap/esm/Container";
import NavbarCollapse from "react-bootstrap/esm/NavbarCollapse";
import Navbar from "react-bootstrap/Navbar";

type NavbarProp = {
    classname?: string; isLogoDark: boolean;
};

// const sectionData = [
//     { id: "home", title: "Hogar" },
//     { id: "features", title: "Facturación Electrónica" },
//     { id: "screenshot", title: "Contabilidad Electrónica" },
//     { id: "testimonial", title: "Testimonios" },
//     { id: "pricing", title: "Precios" },
//     { id: "contact", title: "Contáctanos" },
// ];

const sectionData = [
    { path: "/landing", title: "Hogar" },
    { path: "/facturacion", title: "Facturación Electrónica" },
    { path: "/contabilidad", title: "Contabilidad Electrónica" },
    { path: "/testimonios", title: "Testimonios" },
    { path: "/precios", title: "Precios" },
    { path: "/contacto", title: "Contáctanos" },
];

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


    // const handleLinkClick = (id: string) => {
    //     const section = document.getElementById(id);
    //     if (section != null) {
    //         const sectionTop = section.offsetTop;

    //         window.scrollTo({
    //             top: sectionTop, behavior: "smooth",
    //         });
    //     }
    // };

    return (<>
        <Nav
            className={classNames("navbar navbar-expand-lg fixed-top navbar-custom sticky-dark m-0", classname)}
            ref={navbar}
            id="navbar-sticky"
        >
            <Container>
                <Navbar.Brand>
                    {/* <Link className="logo text-uppercase" to="#"> */}
                    <Link
                        className="logo text-uppercase"
                        to="/"
                        onClick={(e) => {
                            if (path.pathname === "/landing") {
                                e.preventDefault(); // Evita navegación si ya estás en la raíz
                            }
                        }}
                    >

                        {isLogoDark ? (<img src={logoDark} alt="" className="logo-dark" />) : (<>
                            <img src={logoDark} alt="" className="logo-dark" style={{ height: 55, width: "auto" }} />
                            <img src={logoLight} alt="" className="logo-light" style={{ height: 55, width: "auto" }} />

                        </>)}
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
                    <Nav className="navbar-nav mx-auto navbar-center" id="mySidenav">

                        {/* {sectionData.map((section) => (
                            <Nav.Item as="li" key={section.path}>
                                <Link
                                    to={section.path}
                                    className={classNames("nav-link", path.pathname === section.path ? "active" : "")}
                                >
                                    {section.title}
                                </Link>
                            </Nav.Item>
                        ))} */}

                        {sectionData.map((section) => (
                            <Nav.Item as="li" key={section.path}>
                                <Link
                                    to={section.path}
                                    className={classNames("nav-link", path.pathname === section.path ? "active" : "")}
                                    onClick={(e) => {
                                        if (path.pathname === section.path) {
                                            // Cancelamos la navegación si ya estamos en esa ruta
                                            e.preventDefault();
                                        }
                                    }}
                                >
                                    {section.title}
                                </Link>
                            </Nav.Item>
                        ))}


                    </Nav>
                    <Nav as="ul" className="navbar-nav navbar-center">
                        <Nav.Item as="li">
                            <Link to="#" className="nav-link" id="login">
                                Login
                            </Link>
                        </Nav.Item>
                        <Nav.Item as="li">
                            <Link to="#" className="btn btn-sm nav-btn" id="signin">
                                Sign Up
                            </Link>
                        </Nav.Item>
                    </Nav>
                </NavbarCollapse>
            </Container>
        </Nav>
    </>);
};

export default Navbar1;
