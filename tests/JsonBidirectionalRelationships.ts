import test from 'ava';
import {JacksonError} from '../src/core/JacksonError';
import {JsonIdentityInfo, ObjectIdGenerator} from '../src/annotations/JsonIdentityInfo';
import {JsonManagedReference} from '../src/annotations/JsonManagedReference';
import {JsonBackReference} from '../src/annotations/JsonBackReference';
import {JsonIdentityReference} from '../src/annotations/JsonIdentityReference';
import {JsonClass} from '../src/annotations/JsonClass';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/annotations/JsonProperty';


test('Fail Infinite recursion', t => {
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
    @JsonClass({class: () => [User]})
    owner: User;

    constructor(id: number, name: string, owner: User) {
      this.id = id;
      this.name = name;
      this.owner = owner;
    }
  }

  const user = new User(1, 'john.alfa@gmail.com', 'John', 'Alfa');
  const item1 = new Item(1, 'Book', user);
  const item2 = new Item(2, 'Computer', user);
  user.items.push(...[item1, item2]);

  const objectMapper = new ObjectMapper();

  const err = t.throws<JacksonError>(() => {
    objectMapper.stringify<User>(user);
  });

  t.assert(err instanceof JacksonError);
});

test('@JsonManagedReference And @JsonBackReference', t => {
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
    @JsonManagedReference()
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
    @JsonClass({class: () => [User]})
    @JsonBackReference()
    owner: User;

    constructor(id: number, name: string, owner: User) {
      this.id = id;
      this.name = name;
      this.owner = owner;
    }
  }

  const user = new User(1, 'john.alfa@gmail.com', 'John', 'Alfa');
  const item1 = new Item(1, 'Book', user);
  const item2 = new Item(2, 'Computer', user);
  user.items.push(...[item1, item2]);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  // eslint-disable-next-line max-len
  t.is(jsonData, '{"items":[{"id":1,"name":"Book"},{"id":2,"name":"Computer"}],"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}');

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.assert(userParsed.items.length === 2);
  t.assert(userParsed.items[0] instanceof Item);
  t.assert(userParsed.items[0].owner === userParsed);
  t.assert(userParsed.items[1].owner === userParsed);
});

test('Fail @JsonIdentityInfo id already seen without scope', t => {
  @JsonIdentityInfo({generator: ObjectIdGenerator.PropertyGenerator, property: 'id'})
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

  @JsonIdentityInfo({generator: ObjectIdGenerator.PropertyGenerator, property: 'id'})
  class Item {
    @JsonProperty()
    id: number;
    @JsonProperty()
    name: string;

    @JsonProperty()
    @JsonClass({class: () => [User]})
    owner: User;

    constructor(id: number, name: string, owner: User) {
      this.id = id;
      this.name = name;
      this.owner = owner;
    }
  }

  const user = new User(1, 'john.alfa@gmail.com', 'John', 'Alfa');
  const item1 = new Item(1, 'Book', user);
  const item2 = new Item(2, 'Computer', user);
  user.items.push(...[item1, item2]);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  // eslint-disable-next-line max-len
  t.is(jsonData, '{"items":[{"id":1,"name":"Book","owner":1},{"id":2,"name":"Computer","owner":1}],"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}');

  const err = t.throws<JacksonError>(() => {
    objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  });

  t.assert(err instanceof JacksonError);
});

test('@JsonIdentityInfo One To Many', t => {
  @JsonIdentityInfo({generator: ObjectIdGenerator.PropertyGenerator, property: 'id', scope: 'User'})
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

  @JsonIdentityInfo({generator: ObjectIdGenerator.PropertyGenerator, property: 'id', scope: 'Item'})
  class Item {
    @JsonProperty()
    id: number;
    @JsonProperty()
    name: string;

    @JsonProperty()
    @JsonClass({class: () => [User]})
    owner: User;

    constructor(id: number, name: string, owner: User) {
      this.id = id;
      this.name = name;
      this.owner = owner;
    }
  }

  const user = new User(1, 'john.alfa@gmail.com', 'John', 'Alfa');
  const item1 = new Item(1, 'Book', user);
  const item2 = new Item(2, 'Computer', user);
  user.items.push(...[item1, item2]);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  // eslint-disable-next-line max-len
  t.is(jsonData, '{"items":[{"id":1,"name":"Book","owner":1},{"id":2,"name":"Computer","owner":1}],"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}');

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.assert(userParsed.items.length === 2);
  t.assert(userParsed.items[0] instanceof Item);
  t.assert(userParsed.items[0].owner === userParsed);
  t.assert(userParsed.items[1].owner === userParsed);
});

test('@JsonIdentityInfo Many To Many', t => {
  @JsonIdentityInfo({generator: ObjectIdGenerator.PropertyGenerator, property: 'id', scope: 'User'})
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

  @JsonIdentityInfo({generator: ObjectIdGenerator.PropertyGenerator, property: 'id', scope: 'Item'})
  class Item {
    @JsonProperty()
    id: number;
    @JsonProperty()
    name: string;

    @JsonProperty()
    @JsonClass({class: () => [Array, [User]]})
    owners: User[] = [];

    constructor(id: number, name: string) {
      this.id = id;
      this.name = name;
    }
  }

  const user1 = new User(1, 'john.alfa@gmail.com', 'John', 'Alfa');
  const user2 = new User(2, 'alex.beta@gmail.com', 'Alex', 'Beta');
  const item1 = new Item(1, 'Book');
  const item2 = new Item(2, 'Computer');

  user1.items.push(...[item1, item2]);
  user2.items.push(...[item1]);

  item1.owners.push(...[user1, user2]);
  item2.owners.push(...[user1]);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user1);
  // eslint-disable-next-line max-len
  t.is(jsonData, '{"items":[{"owners":[1,{"items":[1],"id":2,"email":"alex.beta@gmail.com","firstname":"Alex","lastname":"Beta"}],"id":1,"name":"Book"},{"owners":[1],"id":2,"name":"Computer"}],"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}');

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.assert(userParsed.items.length === 2);
  t.assert(userParsed.items[0] instanceof Item);
  t.assert(userParsed.items[0].owners.includes(userParsed));
  t.assert(userParsed.items[0].owners.find((owner) => owner.id === user2.id));
});

test('@JsonIdentityInfo One To Many with @JsonIdentityReference', t => {
  @JsonIdentityInfo({generator: ObjectIdGenerator.PropertyGenerator, property: 'id', scope: 'User'})
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

  @JsonIdentityInfo({generator: ObjectIdGenerator.PropertyGenerator, property: 'id', scope: 'Item'})
  @JsonIdentityReference({alwaysAsId: true})
  class Item {
    @JsonProperty()
    id: number;
    @JsonProperty()
    name: string;

    @JsonProperty()
    @JsonClass({class: () => [User]})
    owner: User;

    constructor(id: number, name: string, owner: User) {
      this.id = id;
      this.name = name;
      this.owner = owner;
    }
  }

  const user = new User(1, 'john.alfa@gmail.com', 'John', 'Alfa');
  const item1 = new Item(2, 'Book', user);
  const item2 = new Item(3, 'Computer', user);
  user.items.push(...[item1, item2]);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.is(jsonData, '{"items":[2,3],"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}');
});
