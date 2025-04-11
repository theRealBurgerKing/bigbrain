function Dashboard(){
  const token = localStorage.getItem('token')

  return (
    <>Dashboard
    {token ? <p>Token: {token}</p> : <p>No token found</p>}
    </>
  )
}
export default Dashboard;