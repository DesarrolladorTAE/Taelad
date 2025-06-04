import { Container, Row, Col } from "react-bootstrap";
import {
    FaClock,
    FaCloudDownloadAlt,
    FaCloud,
    FaFileInvoiceDollar,
    FaCalculator,
    FaSyncAlt,
    FaFileAlt,
} from "react-icons/fa";
import { FaUniversity } from "react-icons/fa";
// import { SiSat } from "react-icons/si";
import { MdOutlineFactCheck } from "react-icons/md";

const features = [
    {
        icon: FaClock,
        title: "Ahorra tiempo",
        description: "Ahorra hasta un 90% de tiempo, automatiza tu contabilidad",
    },
    {
        icon: FaCloudDownloadAlt,
        title: "Descarga Masiva",
        description: "Descarga Masiva de ingresos y egresos",
    },
    {
        icon: FaCloud,
        title: "Cloud System",
        description: "Resguarda tu importación de manera segura y automática",
    },
    {
        icon: FaUniversity,
        title: "DIOT",
        description: "Genera e importa la DIOT al portal del SAT",
    },
    {
        icon: MdOutlineFactCheck,
        title: "Facturación y Nóminas",
        description:
            "Facturación Electrónica Genera, timbra, envía tus facturas y guárdalas en la nube",
    },
    {
        icon: FaCalculator,
        title: "Cálculo de Impuestos",
        description: "Cálculo de impuestos en tiempo real",
    },
    {
        icon: FaSyncAlt,
        title: "Conciliación Automática",
        description: "Conciliación Automáticas",
    },
    {
        icon: FaFileInvoiceDollar,
        title: "Pólizas Automáticas",
        description: "Pólizas Automáticas",
    },
    {
        icon: FaFileAlt,
        title: "Reportes Contables",
        description:
            "Reportes contables (Balanza, Balance general, Estados de resultados, Libros) en tiempo real",
    },
];

const Iconos = () => {
    return (
        <section className="section bg-white">
            <Container>
                <Row className="text-center mb-5">
                    <Col>
                        <h2 className="fw-bold">Funcionalidades destacadas</h2>
                        <p className="text-muted">Todo lo que puedes hacer con TAEConta</p>
                    </Col>
                </Row>
                <Row>
                    {features.map((feat, index) => (
                        <Col key={index} md={4} className="mb-5 text-center">
                            <div className="text-primary mb-3" style={{ fontSize: "2rem" }}>
                                {(feat.icon as any)()}
                            </div>
                            <h5 className="fw-bold text-primary">{feat.title}</h5>
                            <p className="text-muted small">{feat.description}</p>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default Iconos;
