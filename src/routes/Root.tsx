import { Navigate } from "react-router-dom";

const Root = () => {
  const getRootUrl = () => {
    let url: string = "landing";

    return url;
  };

  const url = getRootUrl();

  return <Navigate to={`/${url}`} />;
};

export default Root;

// import { Outlet } from "react-router-dom";

// const Root = () => {
//   return (
//     <div>
//       <Outlet />
//     </div>
//   );
// };

// export default Root;
