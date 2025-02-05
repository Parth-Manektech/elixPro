import { lazy } from 'react'


// public Routes Files
const Home = lazy(() => import('../Pages/Home'))



const RoutesDetails = [
  { path: '/', Component: Home, exact: true },
]

export default RoutesDetails
