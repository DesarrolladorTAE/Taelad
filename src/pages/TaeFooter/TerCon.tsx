import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import bgImg from "../../assets/images/TaeFooter/20943526.jpg";

// Navbar y footer
import { Navbar1 } from "../../components/navbar";
import TaeFooter from "../../components/TaeFooter";
import BackToTop from "../../components/BackToTop";
import Login from "../auth/Login";
import Signin from "../auth/Signin";

const TerminosCondiciones: React.FC = () => (
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
                style={{ fontSize: "2.3rem", letterSpacing: 1, textAlign: "center" }}
            >
                Términos y Condiciones
            </h1>
        </div>

        {/* Contenido principal */}
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={11} lg={10}>
                    <div
                        style={{
                            background: "#f8fafc",
                            borderRadius: 12,
                            boxShadow: "0 2px 8px rgba(24,54,122,0.06)",
                            padding: "2.5rem 2rem",
                        }}
                    >
                        {/* <h2 className="fw-bold mb-4 text-center" style={{ color: "#2061b2" }}>
                            Términos y Condiciones
                        </h2> */}
                        <div style={{ whiteSpace: "pre-line", fontSize: "1.08rem" }}>
                            {`INFORMACIÓN GENERAL
Este sitio web es operado por la Tienda de TECNOLOGIAS ADMINISTRATIVAS. En todo el sitio, los términos “nosotros”, “nos” y “nuestro” se refieren a la Tienda de TECNOLOGIAS ADMINISTRATIVAS. La Tienda de TECNOLOGIAS ADMINISTRATIVAS ofrece este sitio web, incluyendo toda la información, herramientas y servicios disponibles para ti en este sitio, el usuario, está condicionado a la aceptación de todos los términos, condiciones, políticas y notificaciones aquí establecidos.


Al visitar nuestro sitio y/o comprar algo de nosotros, participas en nuestro “Servicio” y aceptas los siguientes términos y condiciones (“Términos de Servicio”, “Términos”), incluidos todos los términos y condiciones adicionales y las políticas a las que se hace referencia en el presente documento y/o disponible a través de hipervínculos. Estas Condiciones de Servicio se aplican a todos los usuarios del sitio, incluyendo si limitación a usuarios que sean navegadores, proveedores, clientes, comerciantes, y/o colaboradores de contenido.

Por favor, lee estos Términos de Servicio cuidadosamente antes de acceder o utilizar nuestro sitio web. Al acceder o utilizar cualquier parte del sitio, estás aceptando los Términos de Servicio. Si no estás de acuerdo con todos los términos y condiciones de este acuerdo, entonces no deberías acceder a la página web o usar cualquiera de los servicios. Si las Términos de Servicio son considerados una oferta, la aceptación está expresamente limitada a estos Términos de Servicio.

Cualquier función nueva o herramienta que se añadan a la Tienda de TECNOLOGIAS ADMINISTRATIVAS actual, también estarán sujetas a los Términos de Servicio. Puedes revisar la versión actualizada de los Términos de Servicio, en cualquier momento en esta página. Nos reservamos el derecho de actualizar, cambiar o reemplazar cualquier parte de los Términos de Servicio mediante la publicación de actualizaciones y/o cambios en nuestro sitio web. Es tu responsabilidad chequear esta página periódicamente para verificar cambios. Tu uso continuo o el acceso al sitio web después de la publicación de cualquier cambio constituye la aceptación de dichos cambios.

SECCIÓN 1 - TÉRMINOS DE LA TIENDA EN LÍNEA
Al utilizar este sitio, declaras que tienes al menos la mayoría de edad en tu estado o provincia de residencia, o que tienes la mayoría de edad en tu estado o provincia de residencia y que nos has dado tu consentimiento para permitir que cualquiera de tus dependientes menores use este sitio.

No puedes usar nuestros productos con ningún propósito ilegal o no autorizado tampoco puedes, en el uso del Servicio, violar cualquier ley en tu jurisdicción (incluyendo pero no limitado a las leyes de derecho de autor).

No debes transmitir gusanos, virus o cualquier código de naturaleza destructiva.

El incumplimiento o violación de cualquiera de estos Términos darán lugar al cese inmediato de tus Servicios.

SECCIÓN 2 - CONDICIONES GENERALES
Nos reservamos el derecho de rechazar la prestación de servicio a cualquier persona, por cualquier motivo y en cualquier momento.

Entiendes que tu contenido (sin incluir la información de tu tarjeta de crédito), puede ser transferida sin encriptar e involucrar (a) transmisiones a través de varias redes; y (b) cambios para ajustarse o adaptarse a los requisitos técnicosde conexión de redes o dispositivos. La información de tarjetas de crédito está siempre encriptada durante la transferencia a través de las redes.

Estás de acuerdo con no reproducir, duplicar, copiar, vender, revender o explotar cualquier parte del Servicio, usp del Servicio, o acceso al Servicio o cualquier contacto en el sitio web a través del cual se presta el servicio, sin el expreso permiso por escrito de nuestra parte.

Los títulos utilizados en este acuerdo se icluyen solo por conveniencia y no limita o afecta a estos Términos.

SECCIÓN 3 - EXACTITUD, EXHAUSTVIDAD Y ACTUALIDAD DE LA INFORMACIÓN
No nos hacemos responsables si la información disponible en este sitio no es exacta, completa o actual. El material en este sitio es provisto solo para información general y no debe confiarse en ella o utilizarse como la única base para la toma de decisiones sin consultar primeramente, información más precisa, completa u oportuna. Cualquier dependencia em el materia de este sitio es bajo su propio riesgo.

Este sitio puede contener cierta información histórica. La información histórica, no es necesariamente actual y es provista únicamente para tu referencia. Nos reservamos el derecho de modificar los contenidos de este sitio en cualquier momento, pero no tenemos obligación de actualizar cualquier información en nuestro sitio. Aceptas que es tu responsabilidad de monitorear los cambios en nuestro sitio.

SECCION 4 - MODIFICACIONES AL SERVICIO Y PRECIOS
Los precios de nuestros productos están sujetos a cambio sin aviso.

Nos reservamos el derecho de modificar o discontinuar el Servicio (o cualquier parte del contenido) en cualquier momento sin aviso previo.

No seremos responsables ante ti o alguna tercera parte por cualquier modificación, cambio de precio, suspensión o discontinuidad del Servicio.

Este sitio puede contener cierta información histórica. La información histórica, no es necesariamente actual y es provista únicamente para tu referencia. Nos reservamos el derecho de modificar los contenidos de este sitio en cualquier momento, pero no tenemos obligación de actualizar cualquier información en nuestro sitio. Aceptas que es tu responsabilidad de monitorear los cambios en nuestro sitio.

SECCIÓN 5 - PRODUCTOS O SERVICIOS (si aplicable)
Ciertos productos o servicios puedene star disponibles exclusivamente en línea a través del sitio web. Estos productos o servicios pueden tener cantidades limitadas y estar sujetas a devolución o cambio de acuerdo a nuestra política de devolución solamente.

Hemos hecho el esfuerzo de mostrar los colores y las imágenes de nuestros productos, en la Tienda de TECNOLOGIAS ADMINISTRATIVAS, con la mayor precisión de colores posible. No podemos garantizar que el monitor de tu computadora muestre los colores de manera exacta.

Nos reservamos el derecho, pero no estamos obligados, para limitar las ventas de nuestros productos o servicios a cualquier persona, región geográfica o jurisdicción. Podemos ejercer este derecho basados en cada caso. Nos reservamos el derecho de limitar las cantidades de los productos o servicios que ofrecemos. Todas las descripciones de productos o precios de los productos están sujetos a cambios en cualquier momento sin previo aviso, a nuestra sola discreción. Nos reservamos el derecho de discontinuar cualquier producto en cualquier momento. Cualquier oferta de producto o servicio hecho en este sitio es nulo donde esté prohibido.

No garantizamos que la calidad de los productos, servicios, información u otro material comprado u obtenido por ti cumpla con tus expectativas, o que cualquier error en el Servicio será corregido.

SECCIÓN 6 - EXACTITUD DE FACTURACIÓN E INFORMACIÓN DE CUENTAs
Nos reservamos el derecho de rechazar cualquier pedido que realice con nosotros. Podemos, a nuestra discreción, limitar o cancelar las cantidades compradas por persona, por hogar o por pedido. Estas restricciones pueden incluir pedidos realizados por o bajo la misma cuenta de cliente, la misma tarjeta de crédito, y/o pedidos que utilizan la misma facturación y/o dirección de envío.

En el caso de que hagamos un cambio o cancelemos una orden, podemos intentar notificarte poniéndonos en contacto vía correo electrónico y/o dirección de facturación / número de teléfono proporcionado en el momento que se hizo pedido. Nos reservamos el derecho de limitar o prohibir las órdenes que, a nuestro juicio, parecen ser colocado por los concesionarios, revendedores o distribuidores.

Te comprometes a proporcionar información actual, completa y precisa de la compra y cuenta utilizada para todas las compras realizadas en la Tienda de TECNOLOGIAS ADMINISTRATIVAS. Te comprometes actualizar rápidamente tu cuenta y otra información, incluyendo tu dirección de correo electrónico y números de tarjetas de crédito y fechas de vencimiento, para que podamos completar tus transacciones y contactarte cuando sea necesario.

Para más detalles, por favor revisa nuestra Política de Devoluciones.

SECCIÓN 7 - HERRAMIENTAS OPCIONALES
Es posible que te proporcionemos acceso a herramientas de terceros a los cuales no monitoreamos y sobre los que no tenemos control ni entrada.
Reconoces y aceptas que proporcionamos acceso a este tipo de herramientas “tal cual” y “según disponibilidad” sin garantías, representaciones o condiciones de ningún tipo y sin ningún respaldo. No tendremos responsabilidad alguna derivada de o relacionada con tu uso de herramientas proporcionadas por terceras partes.

Cualquier uso que hagas de las herramientas opcionales que se ofrecen a través del sitio bajo tu propio riesgo y discreción y debes asegurarte de estar familiarizado y aprobar los términos bajo los cuales estas herramientas son proporcionadas por el o los proveedores de terceros.

También es posible que, en el futuro, te ofrezcamos nuevos servicios y/o características a través del sitio web (incluyendo el lanzamiento de nuevas herramientas y recursos). Estas nuevas características y/o servicios también estarán sujetos a estos Términos de Servicio.

SECCIÓN 8 - ENLACES DE TERCERAS PARTES
Cierto contenido, productos y servicios disponibles vía nuestro Servicio puede incluir material de terceras partes.

Enlaces de terceras partes en este sitio pueden direccionarte a sitios web de terceras partes que no están afiliadas con nosotros. No nos responsabilizamos de examinar o evaluar el contenido o exactitud y no garantizamos ni tendremos ninguna obligación o responsabilidad por cualquier material de terceros o sitios web, o de cualquier material, productos o servicios de terceros.

No nos hacemos responsables de cualquier daño o daños relacionados con la adquisición o utilización de bienes, servicios, recursos, contenidos, o cualquier otra transacción realizadas en conexión con sitios web de terceros. Por favor revisa cuidadosamente las políticas y prácticas de terceros y asegúrate de entenderlas antes de participar en cualquier transacción. Quejas, reclamos, inquietudes o preguntas con respecto a productos de terceros deben ser dirigidas a la tercera parte.

SECCIÓN 9 - COMENTARIOS DE USUARIO, CAPTACIÓN Y OTROS ENVÍOS
Si, a pedido nuestro, envías ciertas presentaciones específicas (por ejemplo la participación en concursos) o sin un pedido de nuestra parte envías ideas creativas, sugerencias, proposiciones, planes, u otros materiales, ya sea en línea, por email, por correo postal, o de otra manera (colectivamente, ‘comentarios’), aceptas que podamos, en cualquier momento, sin restricción, editar, copiar, publicar, distribuir, traducir o utilizar por cualquier medio comentarios que nos hayas enviado. No tenemos ni tendremos ninguna obligación (1) de mantener ningún comentario confidencialmente; (2) de pagar compensación por comentarios; o (3) de responder a comentarios.

Nosotros podemos, pero no tenemos obligación de, monitorear, editar o remover contenido que consideremos sea ilegítimo, ofensivo, amenazante, calumnioso, difamatorio, pornográfico, obsceno u objetable o viole la propiedad intelectual de cualquiera de las partes o los Términos de Servicio.

Aceptas que tus comentarios no violarán los derechos de terceras partes, incluyendo derechos de autor, marca, privacidad, personalidad u otro derechos personal o de propiedad. Asimismo, aceptas que tus comentarios no contienen material difamatorio o ilegal, abusivo u obsceno, o contienen virus informáticos u otro malware que pudiera, de alguna manera, afectar el funcionamiento del Servicio o de cualquier sitio web relacionado. No puedes utilizar una dirección de correo electrónico falsa, usar otra identidad que no sea legítima, o engañar a terceras partes o a nosotros en cuanto al origen de tus comentarios. Tu eres el único responsable por los comentarios que haces y su precisión. No nos hacemos responsables y no asumimos ninguna obligación con respecto a los comentarios publicados por ti o cualquier tercer parte.

SECCIÓN 10 - INFORMACIÓN PERSONAL
Tu presentación de información personal a través del sitio se rige por nuestra Política de Privacidad. Para ver nuestra Política de Privacidad.

SECCIÓN 11 - ERRORES, INEXACTITUDES Y OMISIONES
De vez en cuando puede haber información en nuestro sitio o en el Servicio que contiene errores tipográficos, inexactitudes u omisiones que puedan estar relacionadas con las descripciones de productos, precios, promociones, ofertas, gastos de envío del producto, el tiempo de tránsito y la disponibilidad. Nos reservamos el derecho de corregir los errores, inexactitudes u omisiones y de cambiar o actualizar la información o cancelar pedidos si alguna información en el Servicio o en cualquier sitio web relacionado es inexacta en cualquier momento sin previo aviso (incluso después de que hayas enviado tu orden) .

No asumimos ninguna obligación de actualizar, corregir o aclarar la información en el Servicio o en cualquier sitio web relacionado, incluyendo, sin limitación, la información de precios, excepto cuando sea requerido por la ley. Ninguna especificación actualizada o fecha de actualización aplicada en el Servicio o en cualquier sitio web relacionado, debe ser tomada para indicar que toda la información en el Servicio o en cualquier sitio web relacionado ha sido modificado o actualizado.

SECCIÓN 12 - USOS PROHIBIDOS
En adición a otras prohibiciones como se establece en los Términos de Servicio, se prohíbe el uso del sitio o su contenido:

Para ningún propósito ilegal
Para pedirle a otros que realicen o participen en actos ilícitos
Para violar cualquier regulación, reglas, leyes internacionales, federales, provinciales o estatales, u ordenanzas locales
Para infringir o violar el derecho de propiedad intelectual nuestro o de terceras partes
Para acosar, abusar, insultar, dañar, difamar, calumniar, desprestigiar, intimidar o discriminar por razones de género, orientación sexual, religión, etnia, raza, edad, nacionalidad o discapacidad
Para presentar información falsa o engañosa
Para cargar o transmitir virus o cualquier otro tipo de código malicioso que sea o pueda ser utilizado en cualquier forma que pueda comprometer la funcionalidad o el funcionamiento del Servicio o de cualquier sitio web relacionado, otros sitios o Internet
Para recopilar o rastrear información personal de otros
Para generar spam, phish, pharm, pretext, spider, crawl, or scrape
Para cualquier propósito obsceno o inmoral
Para interferir con o burlar los elementos de seguridad del Servicio o cualquier sitio web relacionado¿ otros sitios o Internet. Nos reservamos el derecho de suspender el uso del Servicio o de cualquier sitio web relacionado por violar cualquiera de los ítems de los usos prohibidos.
SECCIÓN 13 - EXCLUSIÓN DE GARANTÍAS; LIMITACIÓN DE RESPONSABILIDAD
No garantizamos ni aseguramos que el uso de nuestro servicio será ininterrumpido, puntual, seguro o libre de errores.
No garantizamos que los resultados que se puedan obtener del uso del servicio serán exactos o confiables.

Aceptas que de vez en cuando podemos quitar el servicio por períodos de tiempo indefinidos o cancelar el servicio en cualquier momento sin previo aviso.

Aceptas expresamente que el uso de, o la posibilidad de utilizar, el servicio es bajo tu propio riesgo. El servicio y todos los productos y servicios proporcionados a través del servicio son (salvo lo expresamente manifestado por nosotros) proporcionados “tal cual” y “según esté disponible” para su uso, sin ningún tipo de representación, garantías o condiciones de ningún tipo, ya sea expresa o implícita, incluidas todas las garantías o condiciones implícitas de comercialización, calidad comercializable, la aptitud para un propósito particular, durabilidad, título y no infracción.

En ningún caso la Tienda de TECNOLOGIAS ADMINISTRATIVAS, nuestros directores, funcionarios, empleados, afiliados, agentes, contratistas, internos, proveedores, prestadores de servicios o licenciantes serán responsables por cualquier daño, pérdida, reclamo, o daños directos, indirectos, incidentales, punitivos, especiales o consecuentes de cualquier tipo, incluyendo, sin limitación, pérdida de beneficios, pérdida de ingresos, pérdida de ahorros, pérdida de datos, costos de reemplazo, o cualquier daño similar, ya sea basado en contrato, agravio (incluyendo negligencia), responsabilidad estricta o de otra manera, como consecuencia del uso de cualquiera de los servicios o productos adquiridos mediante el servicio, o por cualquier otro reclamo relacionado de alguna manera con el uso del servicio o cualquier producto, incluyendo pero no limitado, a cualquier error u omisión en cualquier contenido, o cualquier pérdida o daño de cualquier tipo incurridos como resultados de la utilización del servicio o cualquier contenido (o producto) publicado, transmitido, o que se pongan a disposición a través del servicio, incluso si se avisa de su posibilidad. Debido a que algunos estados o jurisdicciones no permiten la exclusión o la limitación de responsabilidad por daños consecuenciales o incidentales, en tales estados o jurisdicciones, nuestra responsabilidad se limitará en la medida máxima permitida por la ley.

SECCIÓN 14 - INDEMNIZACIÓN
Aceptas indemnizar, defender y mantener indemne la Tienda de TECNOLOGIAS ADMINISTRATIVAS y nuestras matrices, subsidiarias, afiliados, socios, funcionarios, directores, agentes, contratistas, concesionarios, proveedores de servicios, subcontratistas, proveedores, internos y empleados, de cualquier reclamo o demanda, incluyendo honorarios razonables de abogados, hechos por cualquier tercero a causa o como resultado de tu incumplimiento de las Condiciones de Servicio o de los documentos que incorporan como referencia, o la violación de cualquier ley o de los derechos de u tercero.

Aceptas indemnizar, defender y mantener indemne la Tienda de TECNOLOGIAS ADMINISTRATIVAS y nuestras matrices, subsidiarias, afiliados, socios, funcionarios, directores, agentes, contratistas, concesionarios, proveedores de servicios, subcontratistas, proveedores, internos y empleados, de cualquier reclamo o demanda, incluyendo honorarios razonables de abogados, hechos por cualquier tercero a causa o como resultado de tu incumplimiento de las Condiciones de Servicio o de los documentos que incorporan como referencia, o la violación de cualquier ley o de los derechos de u tercero.

SECCIÓN 15 - DIVISIBILIDAD
En el caso de que se determine que cualquier disposición de estas Condiciones de Servicio sea ilegal, nula o inejecutable, dicha disposición será, no obstante, efectiva a obtener la máxima medida permitida por la ley aplicable, y la parte no exigible se considerará separada de estos Términos de Servicio, dicha determinación no afectará la validez de aplicabilidad de las demás disposiciones restantes.

SECCIÓN 16 - RESCISIÓN
Las obligaciones y responsabilidades de las partes que hayan incurrido con anterioridad a la fecha de terminación sobrevivirán a la terminación de este acuerdo a todos los efectos.

Estas Condiciones de servicio son efectivos a menos que y hasta que sea terminado por ti o nosotros. Puedes terminar estos Términos de Servicio en cualquier momento por avisarnos que ya no deseas utilizar nuestros servicios, o cuando dejes de usar nuestro sitio.

Si a nuestro juicio, fallas, o se sospecha que haz fallado, en el cumplimiento de cualquier término o disposición de estas Condiciones de Servicio, también podemos terminar este acuerdo en cualquier momento sin previo aviso, y seguirás siendo responsable de todos los montos adeudados hasta incluida la fecha de terminación; y/o en consecuencia podemos negarte el acceso a nuestros servicios (o cualquier parte del mismo).

SECCIÓN 17 - ACUERDO COMPLETO
Nuestra falla para ejercer o hacer valer cualquier derecho o disposición de estas Condiciones de Servicio no constituirá una renuncia a tal derecho o disposición.

Estas Condiciones del servicio y las políticas o reglas de operación publicadas por nosotros en este sitio o con respecto al servicio constituyen el acuerdo completo y el entendimiento entre tu y nosotros y rigen el uso del Servicio y reemplaza cualquier acuerdo, comunicaciones y propuestas anteriores o contemporáneas, ya sea oral o escrita, entre tu y nosotros (incluyendo, pero no limitado a, cualquier versión previa de los Términos de Servicio).

Cualquier ambigüedad en la interpretación de estas Condiciones del servicio no se interpretarán en contra del grupo de redacción.

SECCIÓN 18 - LEY
Estas Condiciones del servicio y cualquier acuerdos aparte en el que te proporcionemos servicios se regirán e interpretarán en conformidad con las leyes de Carretera Cayaco Puerto Márquez, colonia El Coloso, Acapulco de Juárez, GRO, CP 39810, México.

SECCIÓN 19 - CAMBIOS EN LOS TÉRMINOS DE SERVICIO
Puedes revisar la versión más actualizada de los Términos de Servicio en cualquier momento en esta página.

Nos reservamos el derecho, a nuestra sola discreción, de actualizar, modificar o reemplazar cualquier parte de estas Condiciones del servicio mediante la publicación de las actualizaciones y los cambios en nuestro sitio web. Es tu responsabilidad revisar nuestro sitio web periódicamente para verificar los cambios. El uso continuo de o el acceso a nuestro sitio Web o el Servicio después de la publicación de cualquier cambio en estas Condiciones de servicio implica la aceptación de dichos cambios.

SECCIÓN 20 - INFORMACIÓN DE CONTACTO
Preguntas acerca de los Términos de Servicio deben ser enviadas a raul.alvarez@tecnologiasadministrativas.com`}
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>

        {/* footer */}
        <TaeFooter />
        {/* back to top, login y signin */}
        <BackToTop />
        <Login />
        <Signin />
    </>
);

export default TerminosCondiciones;
