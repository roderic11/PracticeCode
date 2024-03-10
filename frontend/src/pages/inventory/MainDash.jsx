import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import GoalForm from '../components/GoalForm'
import GoalItem from '../components/GoalItem'
import Spinner from '../components/Spinner'
import { getGoals, reset } from '../features/goals/goalSlice'


function Dashboard() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user } = useSelector((state) => state.auth)
  const { goals, isLoading, isError, message } = useSelector(
    (state) => state.goals
  )

  useEffect(() => {
    if (isError) {
      console.log(message)
    }

    if (!user) {
      navigate('/login')
    }

    dispatch(getGoals())

    return () => {
      dispatch(reset())
    }
  }, [user, navigate, isError, message, dispatch])

  if (isLoading) {
    return <Spinner />
  }

  return (
    <>
    
    <h1 className="yow">Main Dashboard</h1>
    <main>
    <div className="menu-container">

     <Link to='/inventory'>
      <button className="menu-item">
        <div className="image-container"> 
          <img src="your-image-url.jpg" />
        </div>
        <a href='#'>Main Inventory</a>
        <p className="description">
        yesyowyow
        </p>
        </button>
        </Link>
      </div>
      <Link to='/Table'>
      <button className="menu-item">
        <div className="image-container">
          <img src="your-image-url.jpg" />
        </div>
        <a href="#">Site Inventory</a>
        <p className="description">
          involves Creating, updating, deleting, and adding items specfic to the
          site
        </p>
      </button>
      </Link>
     

     <Link to='/BOM'>
      <button className="menu-item">
        <div className="image-container"> 
          <img src="your-image-url.jpg" />
        </div>
        <a href='#'>Bill of Materials</a>
        <p className="description">
        yesyowyow
        </p>
        </button>
        </Link>
      
      <Link to='/additem'>
      <button className="menu-item">
        <div className="image-container"> 
          <img src="your-image-url.jpg" />
        </div>
        <a href='#'>Pricing</a>
        <p className="description">
        yoyoyoy
        </p>
        </button>
        </Link>
      
  </main>
</>
    
  )
}

export default Dashboard
