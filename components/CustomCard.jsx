import { Card, CardContent } from '@mui/material'

const CardStyles = (props) => {
  return (
    <Card sx={{ backgroundColor: "#ffffff", borderRadius: "20px", height: "370px" }}>
      <CardContent>
        {props.children}
      </CardContent>
    </Card>
  )
}
export default CardStyles;

