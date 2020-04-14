import {JsonProperty} from './decorators/JsonProperty';
import {ObjectMapper} from './databind/ObjectMapper';
import {JsonGetter} from './decorators/JsonGetter';
import {JsonSetter, JsonSetterNulls} from './decorators/JsonSetter';
import {JsonClass} from './decorators/JsonClass';
import {JsonSerialize} from './decorators/JsonSerialize';
import {JsonDeserialize} from './decorators/JsonDeserialize';
import {JsonIdentityInfo, ObjectIdGenerator} from './decorators/JsonIdentityInfo';
import {JsonTypeInfo, JsonTypeInfoAs, JsonTypeInfoId} from './decorators/JsonTypeInfo';
import {JsonSubTypes} from './decorators/JsonSubTypes';
import {ClassType, JsonParserTransformerContext, JsonStringifierTransformerContext, TypeIdResolver} from './@types';
import {JsonTypeIdResolver} from './decorators/JsonTypeIdResolver';
import {JsonUnwrapped} from './decorators/JsonUnwrapped';
import {JsonValue} from './decorators/JsonValue';
import {JsonView} from './decorators/JsonView';

//
// // class DateSerializer {
// //   static serializeDate(date): any {
// //     return {
// //       year: date.getFullYear(),
// //       month: date.getMonth() + 1,
// //       day: date.getDate(),
// //       formatted: date.toLocaleDateString()
// //     };
// //   }
// //   static deserializeDate(dateObj): Date {
// //     return new Date(dateObj.formatted);
// //   }
// // }
// //
// // // @JsonRootName()
// // // @JsonIgnoreType()
// // @JsonTypeInfo({use: JsonTypeInfoId.NAME, include: JsonTypeInfoAs.PROPERTY, property: 'example2_type'})
// // class Example2 {
// //
// //   name = '';
// //   age = 55;
// //
// //   @JsonSerialize({using: DateSerializer.serializeDate})
// //   @JsonDeserialize({using: DateSerializer.deserializeDate})
// //   date = new Date();
// //
// //   // @JsonBackReference({class: () => Example3})
// //   example;
// //
// //   constructor(name, age, date, example) {
// //     this.name = name;
// //     this.age = age;
// //     this.date = date;
// //     this.example = example;
// //   }
// //
// //   @JsonCreator()
// //   static creator(name, age, date) {
// //     return new Example2(name, age, date, null);
// //   }
// //   // @JsonValue()
// //   getValue() {
// //     return 'ciao ' + this.name;
// //   }
// //
// // }
//
// // @JsonCreator()
// // @JsonIgnoreType()
// // @JsonRootName()
// @JsonPropertyOrder({value: ['example2', 'test2', 'name']})
// // @JsonInclude({value: JsonInclude.Include.NON_EMPTY})
// // @JsonIgnoreProperties({
// //   value: ["age", "username"],
// //   allowGetters: true
// // })
// @JsonTypeInfo({use: JsonTypeInfoId.NAME, include: JsonTypeInfoAs.PROPERTY})
// @JsonSubTypes({types: [
//   {class: () => Example3, name: 'custom_type_name'}
// ]})
// class Example {
//   // @JsonIgnore()
//   @JsonProperty({value: 'username'})
//   name = 'pippo';
//
//   // @JsonInclude({value: JsonInclude.Include.NON_NULL})
//   age = 5;
//
//   mTest = false;
//   test2 = false;
//
//   @JsonRawValue()
//   @JsonProperty({value: 'property_test'})
//   testValue = '{"asd": 5}';
//
//   // @JsonManagedReference({class: () => Example2})
//   example2References;
//
//   constructor(name, age, tttest, example2References) {
//     this.name = name;
//     this.age = age;
//     this.mTest = tttest;
//     this.test2 = !tttest;
//     this.example2References = example2References;
//   }
//
//   @JsonCreator()
//   static creator(name2, age, teeeest/* , example2_references*/) {
//     return new Example(name2, age, teeeest, null/* , example2_references*/);
//   }
//
//   // @JsonAnyGetter({enabled: false})
//   testAnyGetter() {
//     return {
//       age: this.age,
//     };
//   }
//
// }
//
// // @JsonRootName()
// @JsonCreator()
// // @JsonTypeName({value: "example3"})
// class Example3 extends Example {
//   newProperty = 344443434;
// }
// //
// // const test = new Example2('test 1', 20, new Date(), null);
// // const test2 = new Example2('test 2', 40, new Date(), null);
// // // let a = new Example("my name", 45, '');
// // const a = new Example3('my name', null, '', null);
// // // a.example2References = [test, test2];
// // a.example2References = test;
// // // let a = new Example("my name", 45, false);
// // // test.example = a;
// // // test2.example = a;
// // a.testValue = '{"test": 100}';
//
// // let stringified1 = stringify(test, null, "\t");
// // console.log(stringified1)
// // console.log(parse(stringified1, null, { mainCreator: Example2, otherCreators: [Example] }));
//
// // let stringified2 = stringify(a, null, "\t");
// // console.log(stringified2)
// // //console.log(parse(stringified2, null, { mainCreator: Example, otherCreators: [Example2] }));
// // console.log(parse(stringified2, null, { mainCreator: Example3, otherCreators: [Example2] }));
//
//
//
//
// @JsonTypeInfo({use: JsonTypeInfoId.NAME, include: JsonTypeInfoAs.PROPERTY})
// @JsonSubTypes({types:
//   [
//     {class: () => Rectangle},
//     {class: () => Circle}
//   ]
// })
// class Shape {
//
// }
//
// @JsonTypeName({value: 'rectangle'})
// class Rectangle extends Shape {
//   w;
//   h;
//   constructor(w, h) {
//     super();
//     this.w = w;
//     this.h = h;
//   }
// }
//
// @JsonTypeName({value: 'circle'})
// class Circle extends Shape {
//   radius;
//   constructor(radius) {
//     super();
//     this.radius = radius;
//   }
// }
//
// class View {
//
//   @JsonFormat({
//     shape: JsonFormatShape.OBJECT
//   })
//   @JsonDeserialize({using: (shapes) => Object.values(shapes)})
//   // @JsonManagedReference({class: () => Shape})
//   shapes = [];
//   constructor(shapes) {
//     this.shapes = shapes;
//   }
// }
//
// // let view = new View([]);
// // view.shapes = [new Rectangle(10,20), new Circle(5)];
// // let stringified4 = stringify(view, null, "\t");
// // console.log(stringified4)
// // console.log(parse(stringified4, null, { mainCreator: View, otherCreators: [Circle, Rectangle, Shape] }));
//
// class Event {
//   name;
//
//   @JsonFormat({
//     shape: JsonFormatShape.STRING,
//     locale: 'es',
//     pattern: 'dddd YYYY-MM-DDTHH:mm:ssZ[Z]',
//     timezone: 'America/New_York'
//   })
//   @JsonDeserialize({using: (date) => dayjs(date, 'dddd YYYY-MM-DDTHH:mm:ssZ[Z]').toDate()})
//   eventDate;
// }
//
// // let event = new Event();
// // event.name = "Event 1";
// // event.eventDate = new Date();
// // let stringified5 = stringify(event, null, "\t");
// // console.log(stringified5)
// // console.log(parse(stringified5, null, { mainCreator: Event }));
// /*
// class User {
//   id;
//   name;
//
//   // @JsonManagedReference({class: () => Item2})
//   userItems2 = [];
//   // @JsonManagedReference({class: () => Item3})
//   userItems3 = [];
//
//   constructor(id, name) {
//     this.id = id;
//     this.name = name;
//   }
//
//   @JsonCreator()
//   static creator(@JsonProperty({value: 'username'}) name, @JsonProperty({value: 'userId'}) id) {
//     const user = new User(id, name);
//     return user;
//   }
//
//   addItem2(item) {
//     this.userItems2.push(item);
//   }
//
//   addItem3(item) {
//     this.userItems3.push(item);
//   }
//
// }*/
// class Item2 {
//   id;
//   itemName;
//
//   // @JsonBackReference({class: () => User})
//   owner;
//
//   // @JsonBackReference({class: () => Item3, value: "item3"})
//   item3;
//
//   constructor(id, itemName, owner) {
//     this.id = id;
//     this.itemName = itemName;
//     this.owner = owner;
//   }
// }
// class Item3 {
//   id;
//   itemName;
//
//   // @JsonBackReference({class: () => User})
//   owner;
//   // @JsonBackReference({class: () => User, value: "owner2"})
//   owner2;
//
//   // @JsonManagedReference({class: () => Item2, value: "item3"})
//   item2;
//
//   constructor(id, itemName, owner) {
//     this.id = id;
//     this.itemName = itemName;
//     this.owner = owner;
//   }
// }
//
// // const user = new User(1, "John 1");
// // const user2 = new User(2, "John 2");
// // const item2 = new Item2(2, "book 1", user);
// // const item3 = new Item3(3, "book 2", user);
// // //item3.owner2 = user2;
// // item3.item2 = item2;
// // //item2.item3 = item3;
// // user.addItem2(item2);
// // user.addItem3(item3);
// // user2.addItem3(item3);
// // let stringified7 = stringify(user, null, "\t");
// // console.log(stringified7)
// // console.log(parse(
// //   `{
// //   "userId": 1,
// //   "username": "John 1"
// // }
// // `, null, { mainCreator: User});
// // console.log(parse(stringified7, null, { mainCreator: User, otherCreators: [Item3, Item2] }));
//
// class TestJsonProperty {
//   @JsonAlias({values: ['username']})
//   name: string;
// }
//
// // const testJsonProperty = new TestJsonProperty();
// // testJsonProperty.name = 'test';
// // console.log(stringify(testJsonProperty, null, '\t'));
// // console.log(parse(`
// // {
// //         "username": "test"
// // }
// // `, null, {mainCreator: TestJsonProperty}));
// //
// // class TestJsonClassUser {
// //   @JsonProperty({value: 'userId'})
// //   id: number;
// //   email: string;
// //   @JsonSerialize({using: DateSerializer.serializeDate})
// //   @JsonDeserialize({using: DateSerializer.deserializeDate})
// //   date = new Date();
// //
// //   constructor(id, email) {
// //     this.id = id;
// //     this.email = email;
// //   }
// //
// //   @JsonCreator()
// //   static creator(email, @JsonProperty({value: 'userId'}) id) {
// //     return new TestJsonClassUser(id, email);
// //   }
// // }
// /*
// class TestJsonClass {
//   @JsonClass({class: () => TestJsonClassUser})
//   user: TestJsonClassUser;
// }
//
// // const objectMapper = new ObjectMapper();
// //
// // const tUser = new TestJsonClassUser(1, "john.alfa@gmail.com");
// // const testJsonClass = new TestJsonClass();
// // testJsonClass.user = tUser;
// // const stringified8 = `
// // {
// //         "user": {
// //                 "userId": 1,
// //                 "email": "john.alfa@gmail.com",
// //                 "date": {
// //                         "year": 2020,
// //                         "month": 3,
// //                         "day": 11,
// //                         "formatted": "3/11/2020"
// //                 }
// //         },
// //         "unknown": true
// // }
// //
// // `;
// //
// // objectMapper.features.serialization[SerializationFeature.FAIL_ON_SELF_REFERENCES] = true;
// // objectMapper.features.deserialization[DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES] = true;
// //
// // const serializer1: ObjectMapperSerializer = {
// //   mapper: (key, value) => {
// //     value['asd'] = 4;
// //     return value;
// //   },
// //   order: 1,
// //   type: TestJsonClassUser
// // };
// //
// // objectMapper.serializers.push(serializer1);
// //
// // console.log(
// //   objectMapper.stringify<TestJsonClass>(testJsonClass, {format: '\t'})
// // );
// //
// // const deserializer1: ObjectMapperDeserializer = {
// //   mapper: (key, value) => {
// //     if (key === 'user') {
// //       const user = new TestJsonClassUser(value.userId + 3, value.email + "lol");
// //       user.date = value.date;
// //       return user;
// //     }
// //     return value;
// //   },
// //   order: 1
// // };
// // objectMapper.deserializers.push(deserializer1);
// //
// // console.log(objectMapper.parse<TestJsonClass, TestJsonClass>(stringified8,{mainCreator: TestJsonClass}));
//
// class SpecialItem {
//   id;
//
//   @JsonView({value: [() => Views.special]})
//   ownerName;
//
//   constructor(id, ownerName) {
//     this.id = id;
//     this.ownerName = ownerName;
//   }
// }
//
// class Item {
//
//   @JsonView({value: [() => Views.internal, () => Views.public]})
//   id;
//
//   @JsonView({value: [() => Views.public]})
//   itemName;
//
//   @JsonClass({class: () => Item})
//   relatedItem : Item;
//
//   constructor(id, itemName) {
//     this.id = id;
//     this.itemName = itemName;
//   }
// }
// class Public {}
// class Internal {}
// class Special {}
// class Views {
//   static public = Public;
//   static internal = Internal;
//   static special = Special;
// }
// // const objectMapper = new ObjectMapper();
// //
// // objectMapper.features.serialization[SerializationFeature.FAIL_ON_SELF_REFERENCES] = true;
// // objectMapper.features.deserialization[DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES] = true;
// //
// // let specialItem = new SpecialItem(1, 'John');
// // let item = new Item(2, "book");
// // item.relatedItem = item;
// // let stringified6 = objectMapper.stringify<Item>(item, { format: '\t' });
// // console.log(stringified6)
// // console.log(objectMapper.parse<Item, Item>(stringified6, { mainCreator: () => Item }));
//
// class Parent {
//
//   @JsonClass({class: () => Name})
//   //@JsonUnwrapped({prefix: 'parent-'})
//   name: Name;
//
//   age: number;
// }
// @JsonTypeInfo({use: JsonTypeInfoId.NAME, include: JsonTypeInfoAs.WRAPPER_ARRAY})
// class Name {
//   last: string;
//   first: string;
// }
//
// // const objectMapper = new ObjectMapper();
// // objectMapper.features.serialization[SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS] = true;
// // const parent = new Parent();
// // parent.age = 35;
// // parent.name = new Name();
// // parent.name.first = "John";
// // parent.name.last = "Alfa";
// // let stringified9 = objectMapper.stringify<Parent>(parent, { format: '\t' });
// // console.log(stringified9);
// // console.log(objectMapper.parse<Parent, Parent>(stringified9, {mainCreator: Parent}));
//
// @JsonIdentityInfo({generator: ObjectIdGenerator.PropertyGenerator, property: 'id', scope: "Scope - A"})
// class A {
//   id: number;
//   name: string;
//
//   @JsonClass({class: () => B, isIterable: true})
//   b: B[] = [];
//
//   constructor(id: number, name: string) {
//     this.id = id;
//     this.name = name;
//   }
//
// }
//
// //@JsonTypeInfo({use: JsonTypeInfoId.NAME, include: JsonTypeInfoAs.WRAPPER_ARRAY})
// @JsonIdentityInfo({generator: ObjectIdGenerator.PropertyGenerator, property: 'id', scope: "Scope - B"})
// class B {
//   id: number;
//   name: string;
//
//   @JsonClass({class: () => C})
//   c: C;
//
//   constructor(id: number, name: string, c: C) {
//     this.id = id;
//     this.name = name;
//     this.c = c;
//   }
// }
//
// @JsonIdentityInfo({generator: ObjectIdGenerator.PropertyGenerator, property: 'id', scope: "Scope - C"})
// class C {
//   id: number;
//   name: string;
//
//   @JsonClass({class: () => A})
//   a: A;
//
//   constructor(id: number, name: string, a: A) {
//     this.id = id;
//     this.name = name;
//     this.a = a;
//   }
// }
// */
// // const testA = new A(1, 'Element A');
// // const testC = new C(1, 'Element C1', testA);
// // const testB = new B(1, 'Element B1', testC);
// // const testB2 = new B(2, 'Element B2', testC);
// // testA.b.push(testB);
// // testA.b.push(testB2);
// // const objectMapper = new ObjectMapper();
// // let stringified10 = objectMapper.stringify<A>(testA, { format: '\t' });
// // console.log(stringified10);
// // //objectMapper.features.deserialization[DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES] = false;
// // const resultA = objectMapper.parse<A, A>(stringified10, {mainCreator: () => A});
// // console.log(resultA)
// // console.log(resultA.b[0].c === resultA.b[1].c)
//
// const set = new Set<Array<any>>();
// set.add([1, 2]);
// set.add([2]);
// set.add([3]);
// // const objectMapper = new ObjectMapper();
// // let stringified11 = objectMapper.stringify<Set<Array<any>>>(set, { format: '\t' });
// // console.log(stringified11);
// // console.log(objectMapper.parse<Set<Array<any>>>(stringified11, {mainCreator: () => [Set, [Array]]}));
//
// // const user = new User(1, 'asd');
// //
// // const map = new Map<User, Set<Array<any>>>();
// // map.set(user, set);
// // const objectMapper = new ObjectMapper();
// // let stringified12 = objectMapper.stringify<Map<User, Set<Array<any>>>>(map, { format: '\t' });
// // console.log(stringified12);
// // console.log(objectMapper.parse<Map<User, Set<Array<any>>>>(stringified12, {mainCreator: () => [Map, [User, Set]]}));
//
// // class Parent2 {
// //   name: string;
// //
// //   @JsonClass({class: () => [Array, [Child2]]})
// //   @JsonManagedReference()
// //   child: Array<Child2>;
// //
// //   constructor(name: string) {
// //     this.name = name;
// //   }
// // }
// //
// // class Child2 {
// //   name: string;
// //
// //   @JsonClass({class: () => [Parent2]})
// //   @JsonBackReference()
// //   parent: Parent2;
// //
// //   constructor(name: string) {
// //     this.name = name;
// //   }
// // }
// // const objectMapper = new ObjectMapper();
// // const child1 = new Child2('John');
// // const child2 = new Child2('Samanta');
// // const parent1 = new Parent2('Dario');
// // // const parent2 = new Parent2('Nadia');
// // parent1.child.push(...[child1, child2]);
// //
// // const stringified13 = objectMapper.stringify<Parent2>(parent1, { format: '\t' });
// // console.log(stringified13);
// // console.log(objectMapper.parse<Parent2>(stringified13, {mainCreator: () => [Parent2]}));
//
// // const objectMapper = new ObjectMapper();
// // const arr = new Uint8Array([21, 31]);
// // const stringified14 = objectMapper.stringify(arr);
// // console.log(stringified14);
// // console.log(objectMapper.parse<Uint8Array>(stringified14, {mainCreator: () => [Uint8Array]}));
//
//
// // if (BigInt) {
// //   const objectMapper = new ObjectMapper();
// //   // @ts-ignore
// //   const arr = [45n, 54n];
// //   const stringified14 = objectMapper.stringify(arr, {format: '\t'});
// //   console.log(stringified14);
// //   //console.log(objectMapper.parse<Array<bigint>>(stringified14, {mainCreator: () => [Array, [BigInt]]}));
// // }
//
// // const objectMapper = new ObjectMapper();
// // const re = new RegExp('ab+c');
// // const stringified15 = objectMapper.stringify(re);
// // console.log(stringified15);
// // console.log(objectMapper.parse<RegExp>(stringified15, {mainCreator: () => [RegExp]}));
// //
// // const objectMapper = new ObjectMapper();
// // const date = new Date();
// // const stringified16 = objectMapper.stringify(date);
// // console.log(stringified16);
// // console.log(objectMapper.parse<Date>(stringified16, {mainCreator: () => [Date]}));
//
// //
// // class Views {
// //   static public = class Public {};
// //   static internal = class Internal {};
// // }
// //
// // class User {
// //   id: number;
// //   email: string;
// //   @JsonView({value: () => [Views.internal]})
// //   password: string;
// //   @JsonClass({class: () => [Array, [Item]]})
// //   items: Item[] = [];
// // }
// //
// // class Item {
// //   @JsonView({value: () => [Views.internal]})
// //   id: number;
// //   @JsonView({value: () => [Views.public]})
// //   name: string;
// // }
// //
// // const item1 = new Item();
// // item1.id = 1;
// // item1.name = 'Item 1';
// // const item2 = new Item();
// // item2.id = 2;
// // item2.name = 'Item 2';
// // const user = new User();
// // user.id = NaN;
// // user.email = 'john.alfa@gmail.com';
// // user.password = '43jn53rsad';
// // user.items = [item1, item2];
// // const objectMapper = new ObjectMapper();
// //
// // const forType = new WeakMap<ClassType<any>, JsonStringifierOptions>();
// // const forTypeUser = new WeakMap<ClassType<any>, JsonStringifierOptions>();
// //
// // forType.set(User, {
// //   withView: () => Views.internal,
// //   forType: forTypeUser
// // });
// // forTypeUser.set(Item, {
// //   withView: () => Views.public
// // });
// // /*
// // forType.set(Item, {
// //   withView: () => Views.internal
// // });
// // */
// // const jsonData = objectMapper.stringify(user, {
// //   // withView: () => Views.internal,
// //   features: {
// //     [SerializationFeature.WRITE_NAN_AS_ZERO]: true
// //   },
// //   // forType
// // });
// // // const userParsed = objectMapper.parse(jsonData, {
// // //   mainCreator: () => [User],
// // //   withView: () => Views.public,
// // //   forType
// // // });
// // // console.log(userParsed);
// //

//
// @JsonFormat({shape: JsonFormatShape.OBJECT})
// class ArrayEx<T> extends Array<T> {
//   @JsonIgnore()
//   wrapper: number[] = [];
//
//   constructor(...args) {
//     super();
//     this.wrapper = [...args];
//
//     // this line is required for ES5!
//     this.constructor = ArrayEx;
//   }
// }
// class User {
//   id: number;
//   numbers: ArrayEx<number>;
// }
//
// const user = new User();
// user.id = 1;
// user.numbers = new ArrayEx(1, 3, 5);
// const objectMapper = new ObjectMapper();
//
// const jsonData = objectMapper.stringify(user, {
//   annotationsEnabled: {
//     JsonFormat: true,
//     JsonIgnore: false
//   }
// });
// console.log(jsonData);
// console.log(NamingBean.toString());
// console.log(getArgumentNames(NamingBean));
// const namingBean = new NamingBean(1, 'Naming Bean');
// const objectMapper = new ObjectMapper();
// const jsonData = objectMapper.stringify(namingBean);
// console.log(jsonData);
// const namingBeanParsed = objectMapper.parse<NamingBean>(jsonData, {mainCreator: () => [NamingBean]});
// console.log(namingBeanParsed);

// class Item {
//   @JsonClass({class: () => [Number]})
//   id: number;
//   @JsonClass({class: () => [String]})
//   name: string;
//   @JsonClass({class: () => [Boolean]})
//   hidden: boolean;
//
//   constructor(id, name, hidden) {
//     this.id = id;
//     this.name = name;
//     this.hidden = hidden;
//   }
// }
// const item = new Item(null, null, null);
// const objectMapper = new ObjectMapper();
// objectMapper.features.serialization[SerializationFeature.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL] = true;
// console.log(objectMapper.stringify(item));


// class User {
//   @JsonProperty()
//   id: number;
//   @JsonProperty()
//   firstname: string;
//   @JsonProperty()
//   lastname: string;
//   @JsonProperty()
//   map = new Map();
//
//   constructor(id: number, firstname: string, lastname: string) {
//     this.id = id;
//     this.firstname = firstname;
//     this.lastname = lastname;
//   }
// }
// const user = new User(1, 'John', 'Alfa');
// user.map.set('b', 1);
// user.map.set('c', 2);
// user.map.set('a', 3);
// const objectMapper = new ObjectMapper();
// objectMapper.features.serialization[SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS] = true;
// const jsonData = objectMapper.stringify<User>(user);
// console.log(jsonData);

