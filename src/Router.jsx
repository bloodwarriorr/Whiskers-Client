import React, { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './Components/Navbar'
import Admin from './Pages/Admin'
import ItemPage from './Pages/ItemPage'
import Login from './Pages/Login'
import Profile from './Pages/Profile'
import Register from './Pages/Register'
import Shop from './Pages/Shop'
import ProductsDb,{defaultUsers} from './JSON/default-data'
import Footer from './Components/Footer'
import {mostPopular} from './JS/Functions'





export default function Router() {
    const AMOUNT_OF_POPULAR_PRODUCTS = 5
    if (!JSON.parse(localStorage.getItem("products"))) {
        localStorage.setItem("products", JSON.stringify(ProductsDb))
    }
    if (!JSON.parse(localStorage.getItem("users"))) {
        localStorage.setItem("users", JSON.stringify(defaultUsers))
    }
    if (!JSON.parse(localStorage.getItem("isAdmin"))) {
        localStorage.setItem("isAdmin", JSON.stringify(false))
    }
    
    const [products, setProducts] = useState(JSON.parse(localStorage.getItem("products")) || [])
    const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart")) || [])///<----local check
    const [orders, setOrders] = useState([])
    const [ordersInfo, setOrdersInfo] = useState([])
    const [users, setUsers] = useState(JSON.parse(localStorage.getItem("users")) || [])
    const [totalQty, setTotalQty] = useState(0)
    const [totalPrice, setTotalPrice] = useState(0)
    const [currentUser, setCurrentUser] = useState()
    const [isAdmin,setIsAdmin] = useState(JSON.parse(localStorage.getItem("isAdmin")))
    const [mostPopProducts,setMostPopProducts] = useState(mostPopular(users,AMOUNT_OF_POPULAR_PRODUCTS))
    
    const addUser = (user) => {
        setUsers([...users, user])
    }
    const deleteUser=(index)=>{
        let newUserArr=[...users]
        newUserArr.splice(index,1)
        setUsers(newUserArr)
    }
    useEffect(() => {
        localStorage.setItem("users", JSON.stringify(users))
    }, [users])

    const addToCart = (index, qty = 1) => {
        let cartItems
        let product = Object.assign({}, products[index])
        let cartProduct = cart.filter(item => item.index === index)

        if (cartProduct.length === 0) {
            product.qty = 1 * qty
            cartItems = [...cart, product]
        }
        else {
            cartProduct[0].qty = cartProduct[0].qty + qty
            cartItems = [...cart]
        }
        setCart(cartItems)
    }

    const removeItemFromCart = (index) => {
        let newCart = cart.filter((item) => item.index !== index)
        setCart(newCart)
    }

    useEffect(() => {
        if (cart.length !== 0) {
            var total = cart.map(prod => prod.price * prod.qty)
            var qty = cart.map(prod => prod.qty)
            qty = qty.reduce((prev, current) => { return prev + current })
            total = total.reduce((prev, current) => { return prev + current })
            setTotalQty(qty)
            setTotalPrice(total)
        }

    }, [cart])

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem("cart", JSON.stringify([]))
            let updatedUser = { ...currentUser, orders: [...orders], ordersInfo: [...ordersInfo] }
            setCurrentUser(updatedUser)
            let updatedUsers = users.map(user => user.email === currentUser.email ? updatedUser : user)
            setUsers(updatedUsers)
            setCart([])
            setTotalQty(0)
            setTotalPrice(0)
            setMostPopProducts(mostPopular(updatedUsers,AMOUNT_OF_POPULAR_PRODUCTS))
        }

    }, [orders])
    useEffect(() => {
        localStorage.setItem("products", JSON.stringify(products))
    }, [products])

    const buyCart = () => {
        let order = cart
        setOrders([...orders, order])
        setOrdersInfo([...ordersInfo, { date: new Date().toLocaleString() + "",totalPrice:totalPrice },])
    }
    const updateProductPrice = (product) => {
        console.log()
        let index = products.indexOf(product);
        products[index] = product
        setProducts([...products])

    }
    const addProduct = (product) => {
        setProducts([...products, product])
    }
    const deleteProduct = (index) => {
        let tempProducts = products.filter(prod => prod.index !== index)
        setProducts(tempProducts)
    }
    const userLogin = (user) => {
        setOrders([...user.orders])
        setOrdersInfo([...user.ordersInfo])
        setCurrentUser(user)
    }
    
    return (

        <BrowserRouter>
            {!isAdmin && <Navbar isLoggedIn={currentUser !== undefined} logOut={() => setCurrentUser()} buyCart={buyCart} totalQty={totalQty} totalPrice={totalPrice} cart={cart} removeItemFromCart={removeItemFromCart} />}
            <Routes>
                <Route path="/" element={<Shop addToCart={addToCart} mostPopProducts={mostPopProducts} products={products} style={{ display: 'flex', alignItems: 'center' }} />} />
                <Route path="/register" element={<Register addUser={addUser} />} />
                <Route path="/login" element={<Login users={users} setUser={(user) => userLogin(user)} setIsAdmin={(value)=>setIsAdmin(value)} isAdmin={isAdmin} />} />
                {currentUser !== undefined && <Route path="/profile" element={<Profile orders={orders} ordersInfo={ordersInfo} currentUser={currentUser} />} />}
                {isAdmin && <Route path="/admin" element={<Admin setIsAdmin={(v)=>setIsAdmin(v)} deleteUser={deleteUser} products={products} deleteProduct={(index) => deleteProduct(index)} addProduct={addProduct} updateProductPrice={(product) => updateProductPrice(product)} users={users} />} />}
                <Route path="/item" element={<ItemPage addToCart={addToCart} />} />
            </Routes>
            <Footer />
        </BrowserRouter>

    )
}
