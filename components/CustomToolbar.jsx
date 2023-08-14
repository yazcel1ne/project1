import { Toolbar } from "@mui/material";

const CustomToolbar = (props) => {
  return (
    <Toolbar
      sx={{
        marginTop: {
          xs: "70px",
          md: "0",
        },
      }}
    >
      {props.children}
    </Toolbar>
  );
}
export default CustomToolbar;
