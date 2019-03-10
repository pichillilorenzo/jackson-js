import {JsonAnyGetter} from './annotations/JsonAnyGetter';
import {JsonProperty} from './annotations/JsonProperty';
import {JsonPropertyOrder} from './annotations/JsonPropertyOrder';
import {JsonRawValue} from './annotations/JsonRawValue';
import {JsonValue} from './annotations/JsonValue';
import {JsonRootName} from './annotations/JsonRootName';
import {JsonSerialize} from './annotations/JsonSerialize';
import {JsonCreator} from './annotations/JsonCreator';
import {JsonManagedReference} from './annotations/JsonManagedReference';
import {JsonBackReference} from './annotations/JsonBackReference';
import {JsonAnySetter} from './annotations/JsonAnySetter';
import {JsonDeserialize} from './annotations/JsonDeserialize';
import {JsonIgnore} from './annotations/JsonIgnore';
import {JsonIgnoreProperties} from './annotations/JsonIgnoreProperties';
import {JsonIgnoreType} from './annotations/JsonIgnoreType';
import {JsonInclude} from './annotations/JsonInclude';
import {JsonTypeInfo} from './annotations/JsonTypeInfo';
import {JsonTypeName} from './annotations/JsonTypeName';
import {JsonSubTypes} from './annotations/JsonSubTypes';
import {JsonFormat} from './annotations/JsonFormat';
import {JsonView} from './annotations/JsonView';
import {stringify, parse, day_js} from './jackson';

class DateSerializer {
  static serializeDate(date) {
    return {
      "year": date.getFullYear(),
      "month": date.getMonth() + 1,
      "day": date.getDate(),
      "formatted": date.toLocaleDateString()
    };
  }
  static deserializeDate(dateObj) {
    return new Date(dateObj.formatted);
  }
}

//@JsonRootName
//@JsonIgnoreType
@JsonTypeInfo({use: JsonTypeInfo.Id.CLASS, include: JsonTypeInfo.As.PROPERTY, property: 'example2_type'})
class Example2 {
  
  name = "";
  age = 55

  @JsonSerialize({using: DateSerializer.serializeDate})
  @JsonDeserialize({using: DateSerializer.deserializeDate})
  date = new Date();

  //@JsonBackReference({value: "Example3"})
  example;

  constructor (name, age, date, example) {
    this.name = name;
    this.age = age;
    this.date = date;
    this.example = example;
  }

  @JsonCreator
  static creator(name, age, date) {
    return new Example2(name, age, date)
  }
  //@JsonValue
  getValue() {
    return "ciao " + this.name;
  }

}

//@JsonCreator
//@JsonIgnoreType
//@JsonRootName
@JsonPropertyOrder({value: ["example2", "test2", "name"]})
//@JsonInclude({value: JsonInclude.Include.NON_EMPTY})
// @JsonIgnoreProperties({
//   value: ["age", "username"],
//   allowGetters: true
// })
@JsonTypeInfo({use: JsonTypeInfo.Id.NAME, include: JsonTypeInfo.As.PROPERTY})
@JsonSubTypes({value: [
  {value: "Example3", name: 'custom_type_name'}
]})
class Example {
  //@JsonIgnore
  @JsonProperty({value: "username"})
  name = "pippo";

  //@JsonInclude({value: JsonInclude.Include.NON_NULL})
  age = 5;

  mTest = false;
  test2 = false;

  @JsonRawValue
  @JsonProperty({value: "property_test"})
  testValue = '{"asd": 5}';

  @JsonManagedReference({value: Example2})
  example2_references;

  constructor (name, age, test, example2_references) {
    this.name = name;
    this.age = age;
    this.mTest = test;
    this.test2 = !test;
    this.example2_references = example2_references;
  }

  //@JsonAnyGetter({enabled: false})
  testAnyGetter() {
    return {
      "age": this.age,
    }
  }
  
  @JsonCreator({
    properties: {"name2": "username"}
  })
  static creator(name2, age, test/*, example2_references*/) {
    return new Example(name2, age, test/*, example2_references*/);
  }
}

//@JsonRootName
@JsonCreator
//@JsonTypeName({value: "example3"})
class Example3 extends Example {
  new_property = 344443434
}

let test = new Example2("test 1", 20, new Date());
let test2 = new Example2("test 2", 40, new Date());
//let a = new Example("my name", 45, '');
let a = new Example3("my name", null, '');
//a.example2_references = [test, test2];
a.example2_references = test;
//let a = new Example("my name", 45, false);
//test.example = a;
//test2.example = a;
a.testValue = "{\"test\": 100}";

// let stringified1 = stringify(test, null, "\t");
// console.log(stringified1)
// console.log(parse(stringified1, null, { mainCreator: Example2, otherCreators: [Example] }));

// let stringified2 = stringify(a, null, "\t");
// console.log(stringified2)
// //console.log(parse(stringified2, null, { mainCreator: Example, otherCreators: [Example2] }));
// console.log(parse(stringified2, null, { mainCreator: Example3, otherCreators: [Example2] }));

// class Address {
// 	@JsonProperty({value: "village"})
// 	myVillage;
	
// 	@JsonProperty({value: "district"})
//   myDistrict;
  
//   @JsonAnyGetter
//   @JsonAnySetter
//   addressDetails = {
//     'state': '',
//     'country': ''
//   };
  
//   //@JsonAnyGetter
//   testAnyGetter() {
//     return this.addressDetails;
//   }

//   //@JsonAnySetter
//   testAnySetter(key, value) {
//     this.addressDetails[key] = value;
//   }

// } 
// let address = new Address();
// address.myVillage = "ABCD";
// address.myDistrict = "Varanasi";
// address.addressDetails.state = "Uttar Pradesh";
// address.addressDetails.country = "India";

// let jsonData =   "{"
// 			+"\"village\" : \"ABCD\","
// 			+"\"district\" : \"Varanasi\","
// 			+"\"state\" : \"Uttar Pradesh\","
// 			+"\"country\" : \"India\""
// 			+"}";

// let stringified3 = stringify(address, null, '\t')
// console.log(stringified3);
// console.log(parse(stringified3, null, { mainCreator: Address, otherCreators: [] }));
// console.log(parse(jsonData, null, { mainCreator: Address, otherCreators: [] }));



@JsonTypeInfo({use: JsonTypeInfo.Id.NAME, include: JsonTypeInfo.As.PROPERTY})
@JsonSubTypes({value: 
  [
    {value: "Rectangle", name: "rectangle"},
    {value: "Circle", name: "circle"}
  ]
})
class Shape {

}

@JsonTypeName("rectangle")
class Rectangle extends Shape {
  w;
  h;
  constructor(w, h) {
    super();
    this.w = w;
    this.h = h;
  }
}

@JsonTypeName("circle")
class Circle extends Shape {
  radius;
  constructor(radius) {
    super();
    this.radius = radius;
  }
}

class View {

  @JsonFormat({
    shape: JsonFormat.Shape.OBJECT
  })
  @JsonDeserialize({using: (shapes) => { 
    return Object.values(shapes); 
  }})
  @JsonManagedReference({value: Shape})
  shapes = [];
  constructor(shapes) {
    this.shapes = shapes;
  }
}

// let view = new View();
// view.shapes = [new Rectangle(10,20), new Circle(5)];
// let stringified4 = stringify(view, null, "\t");
// console.log(stringified4)
// console.log(parse(stringified4, null, { mainCreator: View, otherCreators: [Circle, Rectangle, Shape] }));

class Event {
  name;

  @JsonFormat({
    shape: JsonFormat.Shape.STRING,
    locale: 'es',
    pattern: "dddd YYYY-MM-DDTHH:mm:ssZ[Z]",
    timezone: "America/New_York"
  })
  @JsonDeserialize({using: (date) => { return day_js(date, "dddd YYYY-MM-DDTHH:mm:ssZ[Z]").toDate(); }})
  eventDate;
}

// let event = new Event();
// event.name = "Event 1";
// event.eventDate = new Date();
// let stringified5 = stringify(event, null, "\t");
// console.log(stringified5)
// console.log(parse(stringified5, null, { mainCreator: Event }));

class Public {}
class Internal extends Public {}
class Views {
  static public = Public;
  static internal = Internal;
}

class Item {
  
  @JsonView({value: "Public"})
  id;

  @JsonView({value: Views.public})
  itemName;

  @JsonView({value: Views.internal})
  ownerName;

  constructor(id, itemName, ownerName) {
    this.id = id;
    this.itemName = itemName;
    this.ownerName = ownerName;
  }
}

let item = new Item(2, "book", "John");
let stringified6 = stringify(item, null, "\t", { view: Views.internal });
console.log(stringified6)
console.log(parse(stringified6, null, { mainCreator: Item, view: Views.public }));

module.export = {
  JsonAnyGetter,
  JsonProperty,
  JsonPropertyOrder,
  JsonRawValue,
  JsonValue,
  JsonRootName,
  JsonSerialize,
  JsonCreator,
  JsonManagedReference,
  JsonBackReference,
  JsonAnySetter,
  JsonDeserialize,
  JsonIgnore,
  JsonIgnoreProperties,
  JsonIgnoreType,
  JsonInclude,
  JsonTypeInfo,
  JsonTypeName,
  JsonSubTypes,
  JsonFormat,
  JsonView
}