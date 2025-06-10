import React from "react";
import Slider from "react-slick";

// Importa tus logos reales
import logo1 from "../../assets/images/IC/logo1.png";
import logo2 from "../../assets/images/IC/logo2.png";
import logo3 from "../../assets/images/IC/logo3.png";
import logo4 from "../../assets/images/IC/logo4.png";
import logo5 from "../../assets/images/IC/logo5.png";
import logo6 from "../../assets/images/IC/logo6.png";
import logo7 from "../../assets/images/IC/logo7.png";
import logo8 from "../../assets/images/IC/logo8.png";
import logo9 from "../../assets/images/IC/logo9.png";
import logo10 from "../../assets/images/IC/logo10.png";
import logo11 from "../../assets/images/IC/logo11.png";
import logo12 from "../../assets/images/IC/logo12.png";

type Logo = {
    src: string;
    alt: string;
};

const logos: Logo[] = [
    { src: logo1, alt: "Cliente 1" },
    { src: logo2, alt: "Cliente 2" },
    { src: logo3, alt: "Cliente 3" },
    { src: logo4, alt: "Cliente 4" },
    { src: logo5, alt: "Cliente 5" },
    { src: logo6, alt: "Cliente 5" },
    { src: logo7, alt: "Cliente 5" },
    { src: logo8, alt: "Cliente 5" },
    { src: logo9, alt: "Cliente 5" },
    { src: logo10, alt: "Cliente 5" },
    { src: logo11, alt: "Cliente 5" },
    { src: logo12, alt: "Cliente 5" },
];

const LogoSlider: React.FC = () => {
    const settings: import("react-slick").Settings = {
        dots: false,
        arrows: false,
        infinite: true,
        speed: 800,
        slidesToShow: 5,
        slidesToScroll: 2,
        autoplay: true,
        autoplaySpeed: 2500,
        pauseOnHover: true,
        responsive: [
            {
                breakpoint: 1200,
                settings: { slidesToShow: 4 }
            },
            {
                breakpoint: 900,
                settings: { slidesToShow: 3 }
            },
            {
                breakpoint: 600,
                settings: { slidesToShow: 2 }
            },
            {
                breakpoint: 400,
                settings: { slidesToShow: 1 }
            },
        ],
    };

    return (
        <div style={{ background: "#7EC8E3", padding: "2rem 0" }}>
            <h2
                className="text-center mb-4"
                style={{
                    fontWeight: 600,
                    color: "#fff"  // O puedes usar "white"
                }}
            >
                Logos realizados por nosotros
            </h2>

            <Slider {...settings}>
                {logos.map((logo, idx) => (
                    <div
                        key={idx}
                        className="d-flex justify-content-center align-items-center"
                        style={{ height: 100 }}
                    >
                        <img
                            src={logo.src}
                            alt={logo.alt}
                            style={{
                                maxHeight: 150,
                                maxWidth: 200,
                                margin: "auto",
                                objectFit: "contain",
                                filter: "grayscale(0.2)",
                                transition: "filter .2s, box-shadow .2s",
                                border: "2px solid #A3D8F4",              // Azul pastel claro
                                borderRadius: "16px",                      // Bordes redondeados
                                background: "#fff",                        // Fondo blanco sutil
                                boxShadow: "0 2px 8px rgba(80,150,200,0.08)", // Sombra azul claro muy suave
                                padding: "10px"                            // Espacio entre logo y borde
                            }}
                            onMouseOver={e => {
                                e.currentTarget.style.filter = "none";
                                e.currentTarget.style.boxShadow = "0 4px 18px rgba(80,150,200,0.18)";
                            }}
                            onMouseOut={e => {
                                e.currentTarget.style.filter = "grayscale(0.2)";
                                e.currentTarget.style.boxShadow = "0 2px 8px rgba(80,150,200,0.08)";
                            }}
                        />

                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default LogoSlider;
