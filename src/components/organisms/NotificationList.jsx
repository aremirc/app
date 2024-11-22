const NotificationList = ({ notifications }) => {
  return (
    <div>
      {notifications.map((note) => (
        <div key={note.id}>{note.message}</div>
      ))}
    </div>
  )
}

export default NotificationList