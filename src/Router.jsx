import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Admin from "./Pages/Admin";
import ItemPage from "./Pages/ItemPage";
import Login from "./Pages/Login";
import Profile from "./Pages/Profile";
import Register from "./Pages/Register";
import Shop from "./Pages/Shop";
import Footer from "./Components/Footer";
import Alert from "@mui/material/Alert";
import AlertTitle from '@mui/material/AlertTitle';
import {
  getAllBottles,
  getTop5,
  signup,
  buyCart as saveOrder,
  login,
  updateProduct,
} from "./Data/database";
import "./App.css";

export default function Router() {
  if (!JSON.parse(localStorage.getItem("isAdmin"))) {
    // אם אין תכונת אדמין נאתחל אותו כשקר
    localStorage.setItem("isAdmin", JSON.stringify(false));
  }

  useEffect(() => {
    const getData = async () => {
      const bottles = await getAllBottles();
      const topBottles = await getTop5(bottles);
      if (bottles) {
        setProducts(bottles);
        setMostPopProducts(topBottles);
        setIsLoader(false);
      }
    };
    getData();
  }, []);
  const [isLoader, setIsLoader] = useState(true);
  // ); //סטייט של רשימת המשתשים
  const [products, setProducts] = useState([]); //סטייט מוצרים
  // ); //רשימת מוצרים פופולריים-מאותחל על ידי פונקציה
  const [mostPopProducts, setMostPopProducts] = useState([]);
  const [isAdmin, setIsAdmin] = useState(
    JSON.parse(localStorage.getItem("isAdmin"))
  ); //סטייט בוליאני המציין האם אדמין מחובר/לא
  const [currentUser, setCurrentUser] = useState(); //משתמש נוכחי אם מחובר
  const [cart, setCart] = useState([]); //עגלה נוכחית
  const [orders, setOrders] = useState([]); //הזמנה של יוזר מסויים
  const [ordersInfo, setOrdersInfo] = useState([]); //פירוט על הזמנה של יוזר מסויים-תאריך וכו
  const [totalQty, setTotalQty] = useState(0); //סטייט של כמות כוללת של מוצרים בעגלה נוכחית
  const [totalPrice, setTotalPrice] = useState(0); //סטייט של סכום כולל של מוצרים בעגלה נוכחית
  const [cartAlert, setCartAlert] = useState({
    isShowen: false,
    type: "",
    title:"",
    body: "",
  });

  //פונקציה להוספת מוצר למערך קיים
  const addUser = (user) => {
    signup(user);
    // setUsers([...users, user]);
  };
  //מחיקת משתמש ממערך משתמשים על פי אינדקס שמגיע מלמטה
  // const deleteUser = (index) => {
  //   let newUserArr = [...users];
  //   newUserArr.splice(index, 1);
  //   setUsers(newUserArr);
  // };
  //קניית עגלה נוכחית והוספת שדה תאריך נוכחי לקנייה
  const buyCart = async () => {
    // let keys = cart.map(prod=>prod.Barcode)
    // let values = cart.map(prod=>prod.qty)
    let order = {
      UserId: currentUser.Id,
      Items: cart.map((prod) => ({
        Barcode: prod.Barcode,
        Bottle_Name: prod.BottleName,
        BrandCode: prod.BrandCode,
        BrandName: prod.BrandName,
        Image: prod.Image,
        Price: prod.Price,
        Qty: prod.qty,
      })),
      // Items: mapCart(keys,values)
    };


    if (await saveOrder(order)) {
      setCart([]);
      let updatedUser = await login({
        Email: currentUser.Email,
        Password: currentUser.Password,
      });
      setCurrentUser(updatedUser);
      setCartAlert({isShowen:true, type:'success', title:"Success",body:'Successfuly Ordered Your Cart!'})
    } else {
      setCartAlert({isShowen:true, type:'error', title:"Error",body:'There Was an Error Ordering Your Cart... Please Try Again Later.'})
    }
  };

  // const mapCart = (keys,values) => {
  //   let obj = {}
  //   for(let i = 0;i<keys.length;i++){
  //     obj[keys[i]] = values[i]
  //   }
  //   return obj;
  // };
  // setOrders([...orders, order]);
  // setOrdersInfo([
  //   ...ordersInfo,
  //   { date: new Date().toLocaleString() + "", totalPrice: totalPrice },
  // ]);

  //עדכון מחיר על פי מוצר מסויים שמגיע מלמטה-ע"י מציאת אינדקס נוכחי של מוצר
  const updateProductPrice = async (product) => {
    let index = products.indexOf(product);
    products[index] = product; // דריסת המוצר במוצר המעודכן שקבילנו מלמטה
    setProducts([...products]);
    let res = await updateProduct(product);
    if (!res) {
      alert("error");
    }
  };
  //הוספת מוצר חדש למערך המוצרים הקיים
  const addProduct = (product) => {
    setProducts([...products, product]);
  };
  // מחיקת מוצר ממערך המוצרים-ע"י פילטור על פי אינדקס שמגיע מלמטה
  const deleteProduct = (index) => {
    let tempProducts = products.filter((prod) => prod.index !== index);
    setProducts(tempProducts);
  };
  //פונקציה לטיפול בהתחברות משתמש-נעדכן את הסטייטים בהתאם
  const userLogin = (user) => {
    // setOrders([...user.orders]);
    // setOrdersInfo([...user.ordersInfo]);
    setCurrentUser(user);
  };
  //פונקציה להוספת מוצר לעגלה, מקבלת אינדקס וכמות
  const addToCart = (Barcode, qty = 1) => {
    let cartItems;
    let product = products.filter((prod) => prod.Barcode === Barcode)[0];
    // let product = Object.assign({}, products[Barcode]); // העתקת הערך ולא הרפרנס של הפרודקט כדי לא לדרוס את הכמות המוקרית
    let cartProduct = cart.filter((item) => item.Barcode === Barcode); // תפיסת המוצר אם קיים בעגלה

    if (cartProduct.length === 0) {
      // אם המערך ריק כלמר שהמוצר לא קיים בעגלה כבר ולכן נכניס ממנו את הכמות הרצוייה
      product.qty = 1 * qty;
      cartItems = [...cart, product];
    } else {
      //אחרת נעדכן את הכמות על פי הכמות שנשלחה למוצר הספציפי
      cartProduct[0].qty = cartProduct[0].qty + qty;
      cartItems = [...cart];
    }
    //לאחר כל הבדיקות והעידכונים הרלוונטים נעדכן את הסטייט
    setCart(cartItems);
  };
  //מחיקת מוצר מן העגלה-על פי אינדקס נשלח
  const removeItemFromCart = (barcode) => {
    let newCart = cart.filter((item) => item.Barcode !== barcode);
    // console.log(newCart);
    setCart(newCart);
  };
  //כל שינוי במערך משתמשים יגרור עדכון בלוקאל
  // useEffect(() => {
  //   localStorage.setItem("users", JSON.stringify(users));
  // }, [users]);

  //כל שינוי בעגלת הקניות יגרור עדכון סטייטים-כמות ומחיר כולל של העגלה
  useEffect(() => {
    if (cart.length !== 0) {
      //כדי שלא יכנס לכאן פעם הראשונה כשהעגלה ריקה
      var total = cart.map((prod) => prod.Price * prod.qty);
      var qty = cart.map((prod) => prod.qty);
      qty = qty.reduce((prev, current) => {
        return prev + current;
      });
      total = total.reduce((prev, current) => {
        return prev + current;
      });
      setTotalQty(qty);
      setTotalPrice(total);
    } else {
      setTotalQty(0);
      setTotalPrice(0);
    }
  }, [cart]);
  //כל שינוי בהזמנה נוכחית יגרור עדכון סטייטים-קניית עגלה
  // useEffect(() => {
  //   if (currentUser) {
  //     //מוכרח להיות משתמש מחובר כדי לקנות
  //     // localStorage.setItem("cart", JSON.stringify([]))
  //     //עדכון ההזמנות במשתמש הנוכחי
  //     //ההזמנה עצמה התעדכנה בסטייטים על ידי פונקצית קניית העגלה
  //     let updatedUser = {
  //       ...currentUser,
  //       orders: [...orders],
  //       ordersInfo: [...ordersInfo],
  //     };
  //     setCurrentUser(updatedUser);
  //     //לאחר שעידכנו את היוזר הנוכחי נעדכן את מערך המשתמשים
  //     let updatedUsers = users.map((user) =>
  //       user.email === currentUser.email ? updatedUser : user
  //     );
  //     setUsers(updatedUsers);
  //     //איפוס סטייטים
  //     setCart([]);
  //     setTotalQty(0);
  //     setTotalPrice(0);
  //     //עידכון המוצרים הפופולרים
  //   }
  // }, [orders]);
  // עדכון מוצרים בלוקאל בכל שינוי במערך המוצרים המקורי
  // useEffect(() => {
  //   localStorage.setItem("products", JSON.stringify(products));
  // }, [products]);

  return (
    <BrowserRouter>
      {!isAdmin && (
        <Navbar
          isLoggedIn={currentUser !== undefined}
          logOut={() => setCurrentUser()}
          buyCart={buyCart}
          totalQty={totalQty}
          totalPrice={totalPrice}
          cart={cart}
          removeItemFromCart={removeItemFromCart}
        />
      )}
      {isLoader && <Loader />}

      <Routes>
        {!isLoader && (
          <Route
            path="/"
            element={
              <Shop
                addToCart={addToCart}
                mostPopProducts={mostPopProducts}
                products={products}
                style={{ display: "flex", alignItems: "center" }}
              />
            }
          />
        )}

        <Route path="/register" element={<Register addUser={addUser} />} />

        <Route
          path="/login"
          element={
            <Login
              // users={users}
              setUser={(user) => userLogin(user)}
              setIsAdmin={(value) => setIsAdmin(value)}
              isAdmin={isAdmin}
            />
          }
        />
        {currentUser !== undefined && (
          <Route
            path="/profile"
            element={<Profile currentUser={currentUser} />}
          />
        )}
        {isAdmin && (
          <Route
            path="/admin"
            element={
              <Admin
                setIsAdmin={(v) => setIsAdmin(v)}
                products={products}
                deleteProduct={(index) => deleteProduct(index)}
                addProduct={addProduct}
                updateProductPrice={(product) => updateProductPrice(product)}
                // users={users}
              />
            }
          />
        )}
        <Route path="/item" element={<ItemPage addToCart={addToCart} />} />
      </Routes>
      <Footer />

      {cartAlert.isShowen && (
       <Alert style={{position:'sticky', bottom:0,zIndex:999}}
       variant="filled"
       onClose={() => {setCartAlert({...cartAlert,isShowen:false})}}
       severity={cartAlert.type}>
       <AlertTitle>{cartAlert.title}</AlertTitle>
       {cartAlert.body}
     </Alert>
      )}
    </BrowserRouter>
  );
}
const Loader = () => {
  return (
    <div style={{ height: "100vh", position: "relative" }}>
      <div className="loader"></div>
    </div>
  );
};
