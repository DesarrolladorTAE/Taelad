import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaRocket, FaEye } from "react-icons/fa";
import bgImg from "../../assets/images/TaeFooter/20943526.jpg";

// Navbar y footer
import { Navbar1 } from "../../components/navbar";
import TaeFooter from "../../components/TaeFooter";
import BackToTop from "../../components/BackToTop";
import Login from "../auth/Login";
import Signin from "../auth/Signin";

const Aviso: React.FC = () => (
    <>
        {/* navbar */}
        <Navbar1 classname="navbar-light" isLogoDark={false} />

        {/* Banner superior */}
        <div
            style={{
                background: `linear-gradient(rgba(24,54,122,0.7),rgba(24,54,122,0.7)), url('${bgImg}') center/cover no-repeat`,
                minHeight: 250,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <h1
                className="text-white fw-bold"
                style={{ fontSize: "3rem", letterSpacing: 1 }}
            >
                Aviso de Privacidad
            </h1>
        </div>

        {/* Sección Misión y Visión */}
       

        {/* Separador */}
        {/* <Container>
            <hr className="my-5" />
        </Container> */}

        {/* Aviso de privacidad integral */}
        <Container className="pb-5">
            <Row className="justify-content-center">
                <Col md={10} lg={9}>
                    <div
                        style={{
                            background: "#f8fafc",
                            borderRadius: 12,
                            boxShadow: "0 2px 8px rgba(24,54,122,0.06)",
                            padding: "2.5rem 2rem",
                        }}
                    >
                        <h2 className="fw-bold mb-4 text-center" style={{ color: "#2061b2" }}>
                            Aviso de privacidad integral
                        </h2>
                        <p>
                            <strong>Tecnologías Administrativas Elad S de RL de CV</strong> con domicilio en Carr. Cayaco – Puerto Marqués, Piedra Roja, El Coloso, 39810 Acapulco de Juárez, Gro. y portal de internet <a href="https://tecnologiasadministrativas.com/" target="_blank" rel="noopener noreferrer">https://tecnologiasadministrativas.com/</a>, es el responsable del uso y protección de sus datos personales, y al respecto le informamos lo siguiente:
                        </p>

                        <h5 className="mt-4 mb-2 fw-semibold">¿Para qué fines utilizaremos sus datos personales?</h5>
                        <p>
                            Los datos personales que recabamos de usted, los utilizaremos para las siguientes finalidades que son necesarias para el servicio que solicita:
                        </p>
                        <ul>
                            <li>Respuesta a mensajes del formulario de contacto</li>
                            <li>Creación de Menús Digitales</li>
                        </ul>

                        <h5 className="mt-4 mb-2 fw-semibold">¿Qué datos personales utilizaremos para estos fines?</h5>
                        <p>
                            Para llevar a cabo las finalidades descritas en el presente aviso de privacidad, utilizaremos los siguientes datos personales:
                        </p>
                        <ul>
                            <li>Datos de identificación y contacto</li>
                            <li>Datos laborales</li>
                        </ul>

                        <h5 className="mt-4 mb-2 fw-semibold">
                            ¿Cómo puede acceder, rectificar o cancelar sus datos personales, u oponerse a su uso o ejercer la revocación de consentimiento?
                        </h5>
                        <p>
                            Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros o bases de datos cuando considere que la misma no está siendo utilizada adecuadamente (Cancelación); así como oponerse al uso de sus datos personales para fines específicos (Oposición). Estos derechos se conocen como derechos ARCO.
                        </p>
                        <p>
                            Para el ejercicio de cualquiera de los derechos ARCO, debe enviar una petición vía correo electrónico a <a href="mailto:contacto@tecnologiasadministrativas.com.mx">contacto@tecnologiasadministrativas.com.mx</a> y deberá contener:
                        </p>
                        <ul>
                            <li>Nombre completo del titular.</li>
                            <li>Domicilio.</li>
                            <li>Teléfono.</li>
                            <li>Correo electrónico usado en este sitio web.</li>
                            <li>Copia de una identificación oficial adjunta.</li>
                            <li>Asunto «Derechos ARCO»</li>
                            <li>
                                Descripción el objeto del escrito, los cuales pueden ser de manera enunciativa más no limitativa los siguientes: Revocación del consentimiento para tratar sus datos personales; y/o Notificación del uso indebido del tratamiento de sus datos personales; y/o Ejercitar sus Derechos ARCO, con una descripción clara y precisa de los datos a Acceder, Rectificar, Cancelar o bien, Oponerse. En caso de Rectificación de datos personales, deberá indicar la modificación exacta y anexar la documentación soporte; es importante en caso de revocación del consentimiento, que tenga en cuenta que no en todos los casos podremos atender su solicitud o concluir el uso de forma inmediata, ya que es posible que por alguna obligación legal requiramos seguir tratando sus datos personales. Asimismo, usted deberá considerar que para ciertos fines, la revocación de su consentimiento implicará que no le podamos seguir prestando el servicio que nos solicitó, o la conclusión de su relación con nosotros.
                            </li>
                        </ul>

                        <h5 className="mt-4 mb-2 fw-semibold">¿En cuántos días le daremos respuesta a su solicitud?</h5>
                        <p>
                            5 días.
                        </p>
                        <h5 className="mt-4 mb-2 fw-semibold">¿Por qué medio le comunicaremos la respuesta a su solicitud?</h5>
                        <p>
                            Al mismo correo electrónico de donde se envío la petición.
                        </p>

                        <h5 className="mt-4 mb-2 fw-semibold">El uso de tecnologías de rastreo en nuestro portal de internet</h5>
                        <p>
                            Le informamos que en nuestra página de internet utilizamos cookies, web beacons u otras tecnologías, a través de las cuales es posible monitorear su comportamiento como usuario de internet, así como brindarle un mejor servicio y experiencia al navegar en nuestra página. Los datos personales que obtenemos de estas tecnologías de rastreo son los siguientes:
                        </p>
                        <ul>
                            <li>Identificadores, nombre de usuario y contraseñas de sesión</li>
                            <li>Región en la que se encuentra el usuario</li>
                        </ul>
                        <p>
                            Estas cookies, web beacons y otras tecnologías pueden ser deshabilitadas. Para conocer cómo hacerlo, consulte el menú de ayuda de su navegador. Tenga en cuenta que, en caso de desactivar las cookies, es posible que no pueda acceder a ciertas funciones personalizadas en nuestro sitio web.
                        </p>

                        <h5 className="mt-4 mb-2 fw-semibold">¿Cómo puede conocer los cambios en este aviso de privacidad?</h5>
                        <p>
                            El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos requerimientos legales; de nuestras propias necesidades por los productos o servicios que ofrecemos; de nuestras prácticas de privacidad; de cambios en nuestro modelo de negocio, o por otras causas. Nos comprometemos a mantener actualizado este aviso de privacidad sobre los cambios que pueda sufrir y siempre podrá consultar las actualizaciones que existan en el sitio web <a href="https://tecnologiasadministrativas.com/" target="_blank" rel="noopener noreferrer">https://tecnologiasadministrativas.com/</a>
                        </p>
                    </div>
                </Col>
            </Row>
        </Container>

        {/* footer */}
        <TaeFooter />
        {/* back to top, login y signin */}
        <BackToTop />
        {/* <Login /> */}
        {/* <Signin /> */}
    </>
);

export default Aviso;
