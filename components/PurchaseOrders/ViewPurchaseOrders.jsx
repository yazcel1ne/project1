import { React, Fragment, useEffect, useState } from 'react';
import {
  Grid,
  Button,
  CardMedia,
  DialogContent,
  Box,
  Tooltip,
  TableCell,

  Table,
  TableBody,
  TableRow,
  Typography
} from '@mui/material';
import PrintPurchaseOrders from './PrintPurchaseOrders';
import { fetchReceiptForOrders } from "../../config/api";

function ViewPurchaseOrders() {
  const [sourceImg, setSourceImg] = useState("");
  const [receipts, setReceipts] = useState([]);
  const [isClicked, setIsClicked] = useState(false);
  const row = JSON.parse(localStorage.getItem('row'));
  const purchaseId = row.id;

  const fetchReceipts = async () => {
    const response = await fetchReceiptForOrders(purchaseId);
    if (response.ok) {
      setReceipts(response.data.receipts);
    }
  };

  const handleClick = (imageUrl) => {
    setSourceImg(imageUrl);
    setIsClicked(false);
  };

  const handleClickPurchaseOrder = () => {
    setIsClicked(true);
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  return (
    <Fragment>

      <Grid container spacing={1} >
        <Grid item xs={12} md={2.4} lg={2.4}>
          <DialogContent>
            <Typography>Purchase Order Receipt</Typography>
            <Box sx={{ height: '65vh' }}>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Tooltip title="View Purchase Order">
                        <Button size="small" variant="contained" onClick={handleClickPurchaseOrder}>
                          Purchase Order
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                  <Fragment>
                    <Typography>Receipt Image</Typography>
                    {receipts.map((receipt, index) => (


                      <TableRow key={index} >
                        <TableCell >
                          <Tooltip title="View Receipt">
                            <Button
                              size="small"
                              variant="contained"
                              disableElevation
                              sx={{ flexGrow: 1, maxWidth: 170 }}
                              onClick={(e) => handleClick(receipt.image)}
                            >
                              <Typography sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {receipt.receipt_number}
                              </Typography>
                            </Button>
                          </Tooltip>
                        </TableCell>
                      </TableRow>

                    ))}
                  </Fragment>
                </TableBody>
              </Table>
            </Box>
          </DialogContent>
        </Grid>


        <Grid item xs={12} md={9.6} lg={9.6}>
          <DialogContent>
            <Box sx={{ height: '69vh' }}>
              {isClicked || !sourceImg ? (

                <PrintPurchaseOrders />

              ) : (
                <CardMedia component="img" src={sourceImg} sx={{ width: 350 }} />
              )}
            </Box>
          </DialogContent>
        </Grid>




      </Grid>
    </Fragment>
  )
}

export default ViewPurchaseOrders