import test from 'ava';
import {ObjectMapper, JacksonError, JsonBackReference, JsonClass, JsonIdentityInfo, JsonManagedReference, ObjectIdGenerator} from '../src';

test('Fail Infinite recursion', t => {
  class User {
    id: number;
    email: string;
    firstname: string;
    lastname: string;

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
    id: number;
    name: string;

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
    id: number;
    email: string;
    firstname: string;
    lastname: string;

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
    id: number;
    name: string;

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
  t.assert(jsonData.includes('john.alfa@gmail.com'));
  t.assert(jsonData.includes('Book'));
  t.assert(jsonData.includes('Computer'));

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
    id: number;
    email: string;
    firstname: string;
    lastname: string;

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
    id: number;
    name: string;

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
  t.assert(jsonData.includes('john.alfa@gmail.com'));
  t.assert(jsonData.includes('Book'));
  t.assert(jsonData.includes('Computer'));

  const err = t.throws<JacksonError>(() => {
    objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  });

  t.assert(err instanceof JacksonError);
});

test('@JsonIdentityInfo One To Many', t => {
  @JsonIdentityInfo({generator: ObjectIdGenerator.PropertyGenerator, property: 'id', scope: 'User'})
  class User {
    id: number;
    email: string;
    firstname: string;
    lastname: string;

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
    id: number;
    name: string;

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
  t.assert(jsonData.includes('john.alfa@gmail.com'));
  t.assert(jsonData.includes('Book'));
  t.assert(jsonData.includes('Computer'));

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
    id: number;
    email: string;
    firstname: string;
    lastname: string;

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
    id: number;
    name: string;

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
  t.assert(jsonData.includes('john.alfa@gmail.com'));
  t.assert(jsonData.includes('alex.beta@gmail.com'));
  t.assert(jsonData.includes('Book'));
  t.assert(jsonData.includes('Computer'));

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.assert(userParsed.items.length === 2);
  t.assert(userParsed.items[0] instanceof Item);
  t.assert(userParsed.items[0].owners.includes(userParsed));
  t.assert(userParsed.items[0].owners.find((owner) => owner.id === user2.id));
});
