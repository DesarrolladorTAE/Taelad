import React, { Suspense } from "react";
import { useRoutes } from "react-router-dom";

//components
import Root from "./Root";

//home
const Home = React.lazy(() => import('../pages/Home'));

//landings
const Index1 = React.lazy(() => import('../pages/landings/Index1'));
// const index2 = React.lazy(() => import('../pages/landings/Index2'));
const index3 = React.lazy(() => import('../pages/landings/Index3'));
const index4 = React.lazy(() => import('../pages/landings/Index4'));
const index5 = React.lazy(() => import('../pages/landings/Index5'));
const index6 = React.lazy(() => import('../pages/landings/Index6'));

const FacEle = React.lazy(() => import('../pages/landings/Index1/FacEle'));
const ConEle = React.lazy(() => import('../pages/landings/Index1/ConEle'));
const DisWeb = React.lazy(() => import('../pages/landings/Index1/DisWeb'));
const ImaCor = React.lazy(() => import('../pages/landings/Index1/ImaCor'));
const MarDig = React.lazy(() => import('../pages/landings/Index1/MarDig'));
const TarjetaJennys = React.lazy(() => import('../tarjetas/TarjetaJennys'));
const EnlacesTerrestres = React.lazy(() => import('../tarjetas/EnlacesTerrestres'));

const Nosotros = React.lazy(() => import('../pages/TaeFooter/Nosotros'));
const AvisoPrivacidad = React.lazy(() => import('../pages/TaeFooter/Aviso'));
const TerminosCondiciones = React.lazy(() => import('../pages/TaeFooter/TerCon'));
// const QuienesSomos = React.lazy(() => import('../pages/QuienesSomos'));
// Y si quieres los de tienda:
// const Tienda = React.lazy(() => import('../pages/Tienda'));
// const MiCuenta = React.lazy(() => import('../pages/MiCuenta'));
// const Carrito = React.lazy(() => import('../pages/Carrito'));

//auth
// const Login = React.lazy(() => import('../pages/auth/Login'))
// const SignUp = React.lazy(() => import('../pages/auth/Signin'))

const loading = () => <div className=""></div>;

// type LoadingComponentProps = {
//     component: React.LazyExoticComponent<() => JSX.Element>;
// };

type LoadingComponentProps = {
    component: React.LazyExoticComponent<React.ComponentType<any>>;
};

const LoadComponent = ({ component: Component }: LoadingComponentProps) => {
    return (
        <Suspense fallback={loading()}>
            <Component />
        </Suspense>
    )
};

// const AllRoutes = () => {
//     return useRoutes([
//         {
//             //root route
//             path: '/',
//             element: <Root/>
//         },
//         {
//             //public routes
//             path: '/',
//             children: [
//                 {
//                     path: 'landing',
//                     element: <LoadComponent component={Home}/>,
//                 },
//                 {
//                     path: 'landing',
//                     children: [
//                         {path: 'index1', element: <LoadComponent component={Index1}/>},
//                         {path: 'index2', element: <LoadComponent component={index2}/>},
//                         {path: 'index3', element: <LoadComponent component={index3}/>},
//                         {path: 'index4', element: <LoadComponent component={index4}/>},
//                         {path: 'index5', element: <LoadComponent component={index5}/>},
//                         {path: 'index6', element: <LoadComponent component={index6}/>},

//                     ],
//                 },
//                 {

//                     // path: 'auth',
//                     // children: [
//                     //     { path: 'login', element: <LoadComponent component={Login} /> },
//                     //     { path: 'signup', element: <LoadComponent component={SignUp} /> },
//                     // ],
//                 },
//             ]
//         }
//     ])
// }

const AllRoutes = () => {
    return useRoutes([
        {
            path: '/',
            element: <Root />
        },
        {
            path: '/',
            children: [
                { path: 'landing', element: <LoadComponent component={Index1} /> }, // Hogar
                { path: 'facturacion', element: <LoadComponent component={FacEle} /> }, // Facturación Electrónica
                { path: 'contabilidad', element: <LoadComponent component={ConEle} /> }, // Contabilidad Electrónica
                { path: 'desarrollo', element: <LoadComponent component={DisWeb} /> }, // Testimonios
                { path: 'diseno', element: <LoadComponent component={ImaCor} /> }, // Precios
                { path: 'marketing', element: <LoadComponent component={MarDig} /> }, // Contáctanos
                 // === Agrega aquí las rutas del footer ===
                { path: 'nosotros', element: <LoadComponent component={Nosotros} /> },
                { path: 'aviso-privacidad', element: <LoadComponent component={AvisoPrivacidad} /> },
                { path: 'terminos-condiciones', element: <LoadComponent component={TerminosCondiciones} /> },
                //Tarjetas de presentación
                { path: 'jennysbananasandfruits', element: <LoadComponent component={TarjetaJennys} /> },
                { path: 'enlaces-terrestres', element: <LoadComponent component={EnlacesTerrestres} /> },

                // { path: 'quienes-somos', element: <LoadComponent component={QuienesSomos} /> },
                // Tienda:
                // { path: 'tienda', element: <LoadComponent component={Tienda} /> },
                // { path: 'mi-cuenta', element: <LoadComponent component={MiCuenta} /> },
                // { path: 'carrito', element: <LoadComponent component={Carrito} /> },
            ]
        }
    ])
}

export default AllRoutes;
