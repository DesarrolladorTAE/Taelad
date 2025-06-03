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


//auth
// const Login = React.lazy(() => import('../pages/auth/Login'))
// const SignUp = React.lazy(() => import('../pages/auth/Signin'))

const loading = () => <div className=""></div>;

type LoadingComponentProps = {
    component: React.LazyExoticComponent<() => JSX.Element>;
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
                { path: 'contabilidad', element: <LoadComponent component={index3} /> }, // Contabilidad Electrónica
                { path: 'testimonios', element: <LoadComponent component={index4} /> }, // Testimonios
                { path: 'precios', element: <LoadComponent component={index5} /> }, // Precios
                { path: 'contacto', element: <LoadComponent component={index6} /> }, // Contáctanos
            ]
        }
    ])
}

export default AllRoutes;
