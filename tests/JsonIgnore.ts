import test from 'ava';
import {JsonIgnore} from '../src/decorators/JsonIgnore';
import {JsonClass} from '../src/decorators/JsonClass';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';
import {JsonGetter} from '../src/decorators/JsonGetter';
import {JsonSetter} from '../src/decorators/JsonSetter';

test('@JsonIgnore at property level', t => {
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    email: string;
    @JsonProperty()
    firstname: string;
    @JsonProperty()
    lastname: string;

    @JsonProperty()
    @JsonClass({class: () => [Array, [Item]]})
    items: Item[] = [];

    constructor(id: number, email: string, firstname: string, lastname: string) {
      this.id = id;
      this.email = email;
      this.firstname = firstname;
      this.lastname = lastname;
    }
  }

  class Item {
    @JsonProperty()
    id: number;
    @JsonProperty()
    name: string;

    @JsonProperty()
    @JsonIgnore()
    category: string;

    @JsonProperty()
    @JsonIgnore()
    @JsonClass({class: () => [User]})
    owner: User;

    constructor(id: number, name: string, category: string, @JsonClass({class: () => [User]}) owner: User) {
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
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"items":[{"id":1,"name":"Game Of Thrones"},{"id":2,"name":"NVIDIA"}],"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}'));

  // eslint-disable-next-line max-len
  const userParsed = objectMapper.parse<User>('{"items":[{"id":1,"name":"Game Of Thrones","category":"Book"},{"id":2,"name":"NVIDIA","category":"Graphic Card"}],"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}',
    {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.email, 'john.alfa@gmail.com');
  t.is(userParsed.firstname, 'John');
  t.is(userParsed.lastname, 'Alfa');
  t.is(userParsed.items.length, 2);
  t.assert(userParsed.items[0] instanceof Item);
  t.is(userParsed.items[0].id, 1);
  t.is(userParsed.items[0].name, 'Game Of Thrones');
  t.is(userParsed.items[0].category, null);
  t.is(userParsed.items[0].owner, null);
  t.assert(userParsed.items[1] instanceof Item);
  t.is(userParsed.items[1].name, 'NVIDIA');
  t.is(userParsed.items[1].category, null);
  t.is(userParsed.items[1].owner, null);
});

test('@JsonIgnore at method level', t => {
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    email: string;
    @JsonProperty()
    firstname: string;
    @JsonProperty()
    lastname: string;

    @JsonProperty()
    @JsonClass({class: () => [Array, [Item]]})
    items: Item[] = [];

    constructor(id: number, email: string, firstname: string, lastname: string) {
      this.id = id;
      this.email = email;
      this.firstname = firstname;
      this.lastname = lastname;
    }
  }

  class Item {
    @JsonProperty()
    id: number;
    @JsonProperty()
    name: string;

    @JsonProperty()
    category: string;

    @JsonProperty()
    @JsonClass({class: () => [User]})
    owner: User;

    constructor(id: number, name: string, category: string, @JsonClass({class: () => [User]}) owner: User) {
      this.id = id;
      this.name = name;
      this.category = category;
      this.owner = owner;
    }

    @JsonGetter()
    @JsonIgnore()
    getCategory(): string {
      return this.category;
    }

    @JsonSetter()
    @JsonIgnore()
    setCategory(category: string) {
      this.category = category;
    }

    @JsonGetter()
    @JsonIgnore()
    @JsonClass({class: () => [User]})
    getOwner(): User {
      return this.owner;
    }

    @JsonSetter()
    @JsonIgnore()
    setOwner(@JsonClass({class: () => [User]}) owner: User) {
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
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"items":[{"id":1,"name":"Game Of Thrones"},{"id":2,"name":"NVIDIA"}],"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}'));

  // eslint-disable-next-line max-len
  const userParsed = objectMapper.parse<User>('{"items":[{"id":1,"name":"Game Of Thrones","category":"Book"},{"id":2,"name":"NVIDIA","category":"Graphic Card"}],"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}',
    {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.email, 'john.alfa@gmail.com');
  t.is(userParsed.firstname, 'John');
  t.is(userParsed.lastname, 'Alfa');
  t.is(userParsed.items.length, 2);
  t.assert(userParsed.items[0] instanceof Item);
  t.is(userParsed.items[0].id, 1);
  t.is(userParsed.items[0].name, 'Game Of Thrones');
  t.is(userParsed.items[0].category, null);
  t.is(userParsed.items[0].owner, null);
  t.assert(userParsed.items[1] instanceof Item);
  t.is(userParsed.items[1].name, 'NVIDIA');
  t.is(userParsed.items[1].category, null);
  t.is(userParsed.items[1].owner, null);
});

test('@JsonIgnore at parameter level', t => {
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    email: string;
    @JsonProperty()
    firstname: string;
    @JsonProperty()
    lastname: string;

    @JsonProperty()
    @JsonClass({class: () => [Array, [Item]]})
    items: Item[] = [];

    constructor(id: number, email: string, firstname: string, lastname: string) {
      this.id = id;
      this.email = email;
      this.firstname = firstname;
      this.lastname = lastname;
    }
  }

  class Item {
    @JsonProperty()
    id: number;
    @JsonProperty()
    name: string;
    @JsonProperty()
    category: string;

    @JsonProperty()
    @JsonClass({class: () => [User]})
    owner: User;

    constructor(id: number, name: string, @JsonIgnore() category: string) {
      this.id = id;
      this.name = name;
      this.category = category;
    }
  }

  const objectMapper = new ObjectMapper();

  // eslint-disable-next-line max-len
  const userParsed = objectMapper.parse<User>('{"items":[{"id":1,"name":"Game Of Thrones","category":"Book"},{"id":2,"name":"NVIDIA","category":"Graphic Card"}],"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}',
    {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.email, 'john.alfa@gmail.com');
  t.is(userParsed.firstname, 'John');
  t.is(userParsed.lastname, 'Alfa');
  t.is(userParsed.items.length, 2);
  t.assert(userParsed.items[0] instanceof Item);
  t.is(userParsed.items[0].id, 1);
  t.is(userParsed.items[0].name, 'Game Of Thrones');
  t.is(userParsed.items[0].category, null);
  t.assert(userParsed.items[0].owner == null);
  t.assert(userParsed.items[1] instanceof Item);
  t.is(userParsed.items[1].name, 'NVIDIA');
  t.is(userParsed.items[1].category, null);
  t.assert(userParsed.items[1].owner == null);
});
