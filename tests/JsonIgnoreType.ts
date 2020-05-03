import test from 'ava';
import {JsonIgnoreType} from '../src/decorators/JsonIgnoreType';
import {JsonClassType} from '../src/decorators/JsonClassType';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';

test('@JsonIgnoreType serialize and deserialize', t => {
  @JsonIgnoreType()
  class Address {
    @JsonProperty() @JsonClassType({type: () => [String]})
    street: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    city: string;

    constructor(street: string, city: string) {
      this.street = street;
      this.city = city;
    }
  }

  class User {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [Address]})
    address: Address;

    // eslint-disable-next-line no-shadow
    constructor(id: number, address: Address) {
      this.id = id;
      this.address = address;
    }
  }

  const address = new Address('421 Sun Ave', 'Yellow Town');
  const user = new User(1, address);
  const objectMapper = new ObjectMapper();
  const jsonData = objectMapper.stringify<User>(user);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1}'));

  const userParsed = objectMapper.parse<User>('{"id":1,"address":{"street":"421 Sun Ave","city":"Yellow Town"}}',
    {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.address, null);
});

test('@JsonIgnoreType serialize and deserialize on list', t => {
  class User {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    email: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    firstname: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    lastname: string;

    @JsonProperty()
    @JsonClassType({type: () => [Array, [Item]]})
    items: Item[] = [];

    constructor(id: number, email: string, firstname: string, lastname: string) {
      this.id = id;
      this.email = email;
      this.firstname = firstname;
      this.lastname = lastname;
    }
  }

  @JsonIgnoreType()
  class Item {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    category: string;
    @JsonProperty()
    @JsonClassType({type: () => [User]})
    owner: User;

    constructor(id: number, name: string, category: string, @JsonClassType({type: () => [User]}) owner: User) {
      this.id = id;
      this.name = name;
      this.category = category;
      this.owner = owner;
    }
  }

  const user = new User(1, 'john.alfa@gmail.com', 'John', 'Alfa');
  const item1 = new Item(1, 'Game Of Thrones', 'Book', user);
  const item2 = new Item(2, 'NVIDIA', 'Graphic Card', user);
  user.items.push(...[item1, item2]);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"items":[],"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}'));

  // eslint-disable-next-line max-len
  const userParsed = objectMapper.parse<User>('{"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa","items":[{"id":1,"name":"Game Of Thrones","category":"Book"},{"id":2,"name":"NVIDIA","category":"Graphic Card"}]}',
    {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.email, 'john.alfa@gmail.com');
  t.is(userParsed.firstname, 'John');
  t.is(userParsed.lastname, 'Alfa');
  t.deepEqual(userParsed.items, []);
});


