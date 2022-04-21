//jshint esversion:6





const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ =require("lodash");
const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));



mongoose.connect("mongodb+srv://admin-jeremy:Sswoy123@cluster0.id8me.mongodb.net/todolistDB", {
  useNewUrlParser: true
});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);
//const Item的I必須要大寫開頭,collection名稱(Item)必須為單數,因為資料庫會自動轉為複數

const item1 = new Item({
  name: "歡迎來到待辦事項"
});

const item2 = new Item({
  name: "點擊 + 增加新事項"
});

const item3 = new Item({
  name: "點擊小方框刪除待辦事項 "
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, itemFound) {
    if (itemFound.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved our default items to DB");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today",newListItems: itemFound});
    }
  })
});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, foundList) {
    if (!err) {

      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save()
        res.redirect("/" + customListName)
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        })
      }
    }
  })
});




app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  })
  if (listName === "Today") {
    item.save();
    res.redirect("/")
  } else {
    List.findOne({name: listName},function(err, foundList) {
          foundList.items.push(item);

          foundList.save()

          res.redirect("/" + listName)
        })
      }

});

app.post("/delete", function(req, res) {
  const checkedItemid = req.body.checkbox;
  const listName = req.body.listName
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemid, function(err) {
      if (!err) {
          res.redirect("/");
      
     }
    })
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemid}}},function(err,foundList){
     if(!err){
       res.redirect("/"+listName);
     }
    })
  }
})

app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});
