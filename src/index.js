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
import {stringify, parse} from './jackson';

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
class Example2 {
  
  name = "";
  age = 55

  @JsonSerialize({using: DateSerializer.serializeDate})
  @JsonDeserialize({using: DateSerializer.deserializeDate})
  date = new Date();

  @JsonBackReference({value: "Example"})
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
@JsonRootName
@JsonPropertyOrder({value: ["example2", "test2", "name"]})
// @JsonIgnoreProperties({
//   value: ["age", "username"],
//   allowGetters: true
// })
class Example {
  //@JsonIgnore
  @JsonProperty({value: "username"})
  name = "pippo";

  age = 5;

  mTest = false;
  test2 = false;

  @JsonRawValue
  @JsonProperty({value: "property_test"})
  testValue = '{"asd": 5}';

  @JsonManagedReference({value: "Example2"})
  example2;

  constructor (name, age, test, example2) {
    this.name = name;
    this.age = age;
    this.mTest = test;
    this.test2 = !test;
    this.example2 = example2;
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
  static creator(name2, age, test/*, example2*/) {
    return new Example(name2, age, test/*, example2*/);
  }
}

let test = new Example2("test 1", 20, new Date());
let test2 = new Example2("test 2", 40, new Date());
let a = new Example("my name", 45, false);
a.example2 = [test, test2];
//let a = new Example("my name", 45, false);
test.example = a;
test2.example = a;
a.testValue = "{\"test\": 100}";

// let stringified1 = stringify(test, null, "\t");
// console.log(stringified1)
// console.log(parse(stringified1, null, { mainCreator: Example2, otherCreators: [Example] }));

let stringified2 = stringify(a, null, "\t");
console.log(stringified2)
console.log(parse(stringified2, null, { mainCreator: Example, otherCreators: [Example2] }));

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
//console.log(parse(jsonData, null, { mainCreator: Address, otherCreators: [] }));

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
  JsonIgnoreType
}