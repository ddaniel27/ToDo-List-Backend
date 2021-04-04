import express from "express";
import bodyParser from "body-parser";
import * as date from "./date.js";
import mongoose from "mongoose";


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin:1234@todotest.oujbm.mongodb.net/todolistDB?retryWrites=true&w=majority",{useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema = new mongoose.Schema({
  name:{
    type: String,
    required: [true, "Name can't be a void field."]
  }
});
const Item = mongoose.model("Item", itemSchema);

const listSchema = new mongoose.Schema({
  name:{
    type: String,
    required: [true, "Sorry, but this can't be a void field."]
  },
  items: [itemSchema]
});
const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Buy milk"
});

const item2 = new Item({
  name: "Do homework"
});

const item3 = new Item({
  name: "Call Laura"
});
/*

item1.save();
item2.save();
item3.save();
*/

app.get("/", function(req, res) {

const day = date.getDate();
Item.find({},function(err,item){
  if(err) console.log(err);
  else{
    res.render("list", {listTitle: day, newListItems: item, senderPage: ""});
  }
});


});

app.post("/", function(req, res){

  let newItem = req.body.newItem;
  new Item({name: newItem}).save(function(err){
    if(err) console.log(err);
    if (req.body.list) {
      res.redirect(`/${req.body.list}`);
    } else {
      res.redirect("/");
    }
  });

});

app.post("/delete", function(req,res){
  let itemToDelete = req.body.checkbox;
  let listToUpdate = req.body.checkbox2;
  if(listToUpdate){
    List.updateOne({name: listToUpdate},{$pull: {items:{_id:itemToDelete}}},function(err,upd){
      if(err) console.log(err);
      res.redirect(`/${listToUpdate}`);
    });
  }else{
    Item.deleteOne({_id: itemToDelete},function(err){
      if(err) console.log(err);
      else res.redirect("/");
    });
  }
});

app.get("/:customListName",function(req, res){
  const customListName = req.params.customListName;
  List.findOne({name: customListName},function(err,list){
    if(!err){
      if(list) {
        res.render("list", {listTitle: customListName, newListItems: list.items, senderPage: customListName});
      }
      else {
        console.log("You don't have that list, but I'll create it for you.")
        const list = new List({
          name: customListName,
          items: [item1, item2, item3]
        });
        list.save(function(err){
          if(err) console.log(err);
          res.redirect("/"+customListName);
        });
      }
    }else console.log(err);
  });
});

app.post("/:customListName",function(req,res){
  const customListName = req.params.customListName;
  const newItem = req.body.newItem;
  List.updateOne({name: customListName},{$push: {items: new Item({name: newItem})}},function(err,update){
    if(err) console.log(err)
    res.redirect("/"+customListName);
  });

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
