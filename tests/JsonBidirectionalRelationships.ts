import test from 'ava';
import {JacksonError} from '../src/core/JacksonError';
import {JsonIdentityInfo, ObjectIdGenerator} from '../src/decorators/JsonIdentityInfo';
import {JsonManagedReference} from '../src/decorators/JsonManagedReference';
import {JsonBackReference} from '../src/decorators/JsonBackReference';
import {JsonIdentityReference} from '../src/decorators/JsonIdentityReference';
import {JsonClass} from '../src/decorators/JsonClass';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';
import {JsonGetter} from '../src/decorators/JsonGetter';
import {JsonSetter} from '../src/decorators/JsonSetter';


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

    constructor(id: number, name: string, @JsonClass({class: () => [User]}) owner: User) {
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

  t.assert(err instanceof Error);
});

test('@JsonManagedReference And @JsonBackReference at property level', t => {
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

    constructor(id: number, name: string, @JsonClass({class: () => [User]}) owner: User) {
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
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"items":[{"id":1,"name":"Book"},{"id":2,"name":"Computer"}],"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}'));

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.assert(userParsed.items.length === 2);
  t.assert(userParsed.items[0] instanceof Item);
  t.assert(userParsed.items[0].owner === userParsed);
  t.assert(userParsed.items[1].owner === userParsed);
});

test('@JsonManagedReference And @JsonBackReference at method level', t => {
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

    @JsonGetter()
    @JsonManagedReference()
    @JsonClass({class: () => [Array, [Item]]})
    getItems(): Item[] {
      return this.items;
    }

    @JsonSetter()
    setItems(@JsonClass({class: () => [Array, [Item]]}) items: Item[]) {
      this.items = items;
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

    constructor(id: number, name: string, @JsonClass({class: () => [User]}) owner: User) {
      this.id = id;
      this.name = name;
      this.owner = owner;
    }

    @JsonGetter()
    @JsonBackReference()
    @JsonClass({class: () => [User]})
    getOwner(): User {
      return this.owner;
    }

    @JsonSetter()
    setOwner(@JsonClass({class: () => [User]}) owner: User) {
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
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"items":[{"id":1,"name":"Book"},{"id":2,"name":"Computer"}],"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}'));

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

    constructor(id: number, name: string, @JsonClass({class: () => [User]}) owner: User) {
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
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"items":[{"id":1,"name":"Book","owner":1},{"id":2,"name":"Computer","owner":1}],"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}'));

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

    constructor(id: number, name: string, @JsonClass({class: () => [User]}) owner: User) {
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
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"items":[{"id":1,"name":"Book","owner":1},{"id":2,"name":"Computer","owner":1}],"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}'));

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.assert(userParsed.items.length === 2);
  t.assert(userParsed.items[0] instanceof Item);
  t.assert(userParsed.items[0].owner === userParsed);
  t.assert(userParsed.items[1].owner === userParsed);
});

test('@JsonIdentityInfo One To Many at property level', t => {
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
    @JsonIdentityInfo({generator: ObjectIdGenerator.PropertyGenerator, property: 'id', scope: 'User'})
    owner: User;

    constructor(id: number, name: string) {
      this.id = id;
      this.name = name;
    }

  }

  const user = new User(1, 'john.alfa@gmail.com', 'John', 'Alfa');
  const item1 = new Item(1, 'Book');
  const item2 = new Item(2, 'Computer');
  user.items.push(...[item1, item2]);
  item1.owner = user;
  item2.owner = user;

  user.items.push(...[item1, item2]);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"name":"Book","owner":{"items":[1,{"id":2,"name":"Computer","owner":1}],"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}}'));

  const itemParsed = objectMapper.parse<Item>(jsonData, {mainCreator: () => [Item]});
  t.assert(itemParsed instanceof Item);
  t.assert(itemParsed.owner instanceof User);
  t.assert(itemParsed.owner.items.length === 2);
  t.assert(itemParsed.owner.items[0] instanceof Item);
  t.assert(itemParsed.owner.items[1] instanceof Item);
  t.assert(itemParsed.owner.items[0].owner === itemParsed.owner);
  t.assert(itemParsed.owner.items[1].owner === itemParsed.owner);
});

test('@JsonIdentityInfo One To Many at method level', t => {
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

    constructor(id: number, name: string) {
      this.id = id;
      this.name = name;
    }

    @JsonGetter()
    @JsonIdentityInfo({generator: ObjectIdGenerator.PropertyGenerator, property: 'id', scope: 'User'})
    @JsonClass({class: () => [User]})
    getOwner(): User {
      return this.owner;
    }

    @JsonSetter()
    @JsonIdentityInfo({generator: ObjectIdGenerator.PropertyGenerator, property: 'id', scope: 'User'})
    setOwner(@JsonClass({class: () => [User]}) owner: User) {
      this.owner = owner;
    }
  }

  const user = new User(1, 'john.alfa@gmail.com', 'John', 'Alfa');
  const item1 = new Item(1, 'Book');
  const item2 = new Item(2, 'Computer');
  user.items.push(...[item1, item2]);
  item1.owner = user;
  item2.owner = user;

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Item>(item1);
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"name":"Book","owner":{"items":[1,{"id":2,"name":"Computer","owner":1}],"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}}'));

  const itemParsed = objectMapper.parse<Item>(jsonData, {mainCreator: () => [Item]});
  t.assert(itemParsed instanceof Item);
  t.assert(itemParsed.owner instanceof User);
  t.assert(itemParsed.owner.items.length === 2);
  t.assert(itemParsed.owner.items[0] instanceof Item);
  t.assert(itemParsed.owner.items[1] instanceof Item);
  t.assert(itemParsed.owner.items[0].owner === itemParsed.owner);
  t.assert(itemParsed.owner.items[1].owner === itemParsed.owner);
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
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"items":[{"owners":[1,{"items":[1],"id":2,"email":"alex.beta@gmail.com","firstname":"Alex","lastname":"Beta"}],"id":1,"name":"Book"},{"owners":[1],"id":2,"name":"Computer"}],"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}'));


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

    constructor(id: number, name: string, @JsonClass({class: () => [User]}) owner: User) {
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
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"items":[2,3],"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}'));
});

test('@JsonIdentityInfo One To Many with @JsonIdentityReference at property level', t => {
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
    @JsonIdentityReference({alwaysAsId: true})
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

    constructor(id: number, name: string, @JsonClass({class: () => [User]}) owner: User) {
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
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"items":[2,3],"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}'));
});

test('@JsonIdentityInfo One To Many with @JsonIdentityReference at parameter level', t => {
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
    @JsonIdentityReference({alwaysAsId: true})
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

    constructor(id: number, name: string, @JsonClass({class: () => [User]}) owner: User) {
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
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"items":[2,3],"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}'));
});
