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
}

//@JsonRootName
class Example2 {
  
  name = "";
  age = 55
  @JsonSerialize({using: DateSerializer.serializeDate})
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
    return new Example2(name, age, new Date(date.formatted))
  }
  //@JsonValue
  getValue() {
    return "ciao " + this.name;
  }

}

//@JsonCreator
@JsonRootName
@JsonPropertyOrder({value: ["example2", "test2", "name"]})
class Example {
  @JsonProperty({value: "username"})
  name = "";

  age = 5;

  mTest = false;

  @JsonRawValue
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
  test() {
    return {
      "age": this.age,
    }
  }
  
  @JsonCreator({
    properties: {"name": "username"}
  })
  static creator(name, age, test/*, example2*/) {
    return new Example(name, age, test/*, example2*/);
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

let stringified1 = stringify(test, null, "\t");
//console.log(stringified1)
let stringified2 = stringify(a, null, "\t");
//console.log(stringified2)

console.log(parse(stringified1, null, { mainCreator: Example2, otherCreators: [Example] }))
console.log(parse(stringified2, null, { mainCreator: Example, otherCreators: [Example2] }))
// console.log(parse(`{
//   "name": "my name",
//   "age": 45
// }`, null, { creator: Example }))

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
  JsonBackReference
}