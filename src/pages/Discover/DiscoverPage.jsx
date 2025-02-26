import React from 'react';
import Header from "../../components/header/Header";
import './DiscoverPage.css';

const fakeOutfitList = [
  {"outfitName":"Simple  White Summer", 
    "outfitImage":null,
    "outfitID":1,
    "items":
      [{"itemID":1,"brand":"H&M","name": "Caqui Hat", "price": 32.99 , "image": "https://image.hm.com/assets/hm/4f/98/4f9835b075ad1bb554cabc851a099efd313887f1.jpg?imwidth=1536"},
      {"itemID":2,"brand":"H&M","name": "Caqui Shorts", "price": 35.99, "image": "https://image.hm.com/assets/hm/a4/de/a4de3e23bbff8294ac11887f01bdea22f8e5f1a8.jpg?imwidth=1536"},
      {"itemID":3,"brand":"H&M","name": "Caqui Tee", "price": 39.99, "image": "https://image.hm.com/assets/hm/e4/2c/e42cf363bd794ee8c09dd22bd21efa6048e898d5.jpg?imwidth=1536"}]
  },
  {"outfitName":"Jeans Combo", 
    "outfitID":2,
    "outfitImage":"https://image.hm.com/content/dam/global_campaigns/season_01/men/start-page-assets/w04/cat-entries/MS11CE10-Jeans-CE-w04.jpg?imwidth=1536",
    "items":
      [{"itemID":4,"brand":"H&M","name": "Baggy Jeans", "price": 71.99 , "image": "https://image.hm.com/assets/hm/2c/77/2c77a9ff7cf1bc0cd4f2c2c94c23cff06ea3d555.jpg?imwidth=657"},
      {"itemID":5,"brand":"H&M","name": "Jean Jacket", "price": 49.99, "image": "https://image.hm.com/assets/hm/a1/ae/a1ae4d7e6eafb9dfa9a618ce87bc1ffc8583655d.jpg?imwidth=657"}]
  },
  {"outfitName":"Relaxed Chilly Day", 
    "outfitID":3,
    "outfitImage":"https://image.hm.com/content/dam/global_campaigns/season_01/men/start-page-assets/w04/cat-entries/MS11CE8-Tshirts-tops-CE-w04.jpg?imwidth=1536",
    "items":
      [{"itemID":6,"brand":"H&M","name": "Knight Sweater", "price": 65.99 , "image": "https://image.hm.com/assets/hm/bd/6a/bd6af2e19d50a33077662696cd01a8ee27691e02.jpg?imwidth=657"},
      {"itemID":7,"brand":"H&M","name": "Jean Jacket", "price": 44.99, "image": "https://image.hm.com/assets/hm/80/67/8067893a23b923983beda69a988a67e9983cf361.jpg?imwidth=657"}]
  }
]

const DiscoverPage = () => {
  return (
    <div className="discover">
      <Header title="Discover" />
      <div className="discover-content">
        <p>Discover stuff here</p>
      </div>
    </div>
  );
};

export default DiscoverPage;