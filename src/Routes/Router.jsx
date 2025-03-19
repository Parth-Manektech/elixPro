import { lazy } from 'react'


// public Routes Files
const Home = lazy(() => import('../Pages/Home'))
const TuttiIprocedimenti = lazy(() => import('../Pages/TuttiIprocedimenti'))
const Stati = lazy(() => import('../Pages/Stati'))
const Ruoli = lazy(() => import('../Pages/Ruoli'))
const Liste = lazy(() => import('../Pages/Liste'))
const Azioni = lazy(() => import('../Pages/Azioni'))
const Editor = lazy(() => import('../Pages/Editor'))



const RoutesDetails = [
  { path: '/', Component: Home, exact: true },
  { path: '/tutti-i-procedimenti', Component: TuttiIprocedimenti, exact: true },
  { path: '/tutti-i-procedimenti/procedimento-x/ruoli', Component: Ruoli, exact: true },
  { path: '/tutti-i-procedimenti/procedimento-x/stati', Component: Stati, exact: true },
  { path: '/tutti-i-procedimenti/procedimento-x/liste', Component: Liste, exact: true },
  { path: '/tutti-i-procedimenti/procedimento-x/azioni', Component: Azioni, exact: true },
  { path: '/tutti-i-procedimenti/procedimento-x/editor', Component: Editor, exact: true },

]

export default RoutesDetails
