import React from 'react'
import useStyles from '../Styles/ShopStyle';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

export default function ProductCard(props) {
  const navigate = useNavigate();
  const classes = useStyles();
  const {Image,BrandName,BottleName,Price,Barcode} = props.product
  return (
    <div className={classes.ProductCard}>
      <img src={Image} alt={BottleName} onClick={()=>navigate('/item', {state:props.product})}/>
      <div className={classes.ProductInfo}>
        <Typography sx={{fontSize:16,fontWeight:'bold'}} variant='p'>{BrandName} {BottleName}</Typography>
        <Typography sx={{fontWeight:'light'}} variant='p'>{Price}$</Typography>
        <Button variant='contained' onClick={()=>props.addToCart(Barcode)}>Buy</Button>
      </div>
    </div>
  )
}
