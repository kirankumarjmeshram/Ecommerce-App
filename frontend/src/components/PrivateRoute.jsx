import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";;

const PrivateRoute = () => {
    const {userInfo} = useSelector(state => state.auth)
  return userInfo ? <Outlet /> : <Navigate to="./login" replace/>
//   replace any past history route
}

export default PrivateRoute