import React, { useState } from 'react';
import './Cart.css';
import { AiOutlineShoppingCart, AiFillDelete } from 'react-icons/ai';

const Cart = ({ cart, setCart }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleCart = () => {
    setIsOpen(!isOpen);
  };

  // Optional: remove an item from cart
  const handleRemoveItem = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  return (
    <div className="cart-wrapper">
      <div className="cart-icon" onClick={handleToggleCart}>
        <AiOutlineShoppingCart />
        {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
      </div>

      {isOpen && (
        <div className="cart-dropdown">
          <h4>My Cart</h4>
          {cart.length === 0 ? (
            <div className="empty-cart">No items in cart.</div>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="cart-item">
                {/* If item has an image */}
                {item.image && (
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                )}
                <div className="cart-item-details">
                  <div>{item.name}</div>
                  {/* Optional remove button */}
                  <button onClick={() => handleRemoveItem(index)}> <AiFillDelete/> </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Cart;
