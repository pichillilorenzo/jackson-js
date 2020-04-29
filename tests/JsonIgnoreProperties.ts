import test from 'ava';
import {JsonGetter} from '../src/decorators/JsonGetter';
import {JsonSetter} from '../src/decorators/JsonSetter';
import {JsonClassType} from '../src/decorators/JsonClassType';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonIgnoreProperties} from '../src/decorators/JsonIgnoreProperties';
import {JsonProperty} from '../src/decorators/JsonProperty';

test('@JsonIgnoreProperties', t => {
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

  @JsonIgnoreProperties({
    value: ['owner']
  })
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
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"items":[{"id":1,"name":"Game Of Thrones","category":"Book"},{"id":2,"name":"NVIDIA","category":"Graphic Card"}],"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}'));

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.email, 'john.alfa@gmail.com');
  t.is(userParsed.firstname, 'John');
  t.is(userParsed.lastname, 'Alfa');
  t.is(userParsed.items.length, 2);
  t.is(userParsed.items[0].id, 1);
  t.is(userParsed.items[0].name, 'Game Of Thrones');
  t.is(userParsed.items[0].category, 'Book');
  t.is(userParsed.items[0].owner, null);
  t.is(userParsed.items[1].id, 2);
  t.is(userParsed.items[1].name, 'NVIDIA');
  t.is(userParsed.items[1].category, 'Graphic Card');
  t.is(userParsed.items[1].owner, null);
});

test('@JsonIgnoreProperties at property level', t => {
  @JsonIgnoreProperties({
    value: ['firstname']
  })
  class User {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    email: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    firstname: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    lastname: string;

    @JsonIgnoreProperties({
      value: ['owner']
    })
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
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"email":"john.alfa@gmail.com","lastname":"Alfa","items":[{"id":1,"name":"Game Of Thrones","category":"Book"},{"id":2,"name":"NVIDIA","category":"Graphic Card"}]}'));

  // eslint-disable-next-line max-len
  const userParsed = objectMapper.parse<User>('{"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa","items":[{"id":1,"name":"Game Of Thrones","category":"Book","owner":{"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}},{"id":2,"name":"NVIDIA","category":"Graphic Card","owner":{"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}}]}', {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.email, 'john.alfa@gmail.com');
  t.is(userParsed.firstname, null);
  t.is(userParsed.lastname, 'Alfa');
  t.is(userParsed.items.length, 2);
  t.is(userParsed.items[0].id, 1);
  t.is(userParsed.items[0].name, 'Game Of Thrones');
  t.is(userParsed.items[0].category, 'Book');
  t.is(userParsed.items[0].owner, null);
  t.is(userParsed.items[1].id, 2);
  t.is(userParsed.items[1].name, 'NVIDIA');
  t.is(userParsed.items[1].category, 'Graphic Card');
  t.is(userParsed.items[1].owner, null);
});

test('@JsonIgnoreProperties at method level', t => {
  @JsonIgnoreProperties({
    value: ['firstname']
  })
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

    @JsonGetter()
    @JsonClassType({type: () => [Array, [Item]]})
    @JsonIgnoreProperties({
      value: ['owner']
    })
    getItems(): Item[] {
      return this.items;
    }

    @JsonSetter()
    @JsonIgnoreProperties({
      value: ['owner']
    })
    setItems(@JsonClassType({type: () => [Array, [Item]]}) items: Item[]) {
      this.items = items;
    }
  }

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
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"email":"john.alfa@gmail.com","lastname":"Alfa","items":[{"id":1,"name":"Game Of Thrones","category":"Book"},{"id":2,"name":"NVIDIA","category":"Graphic Card"}]}'));

  // eslint-disable-next-line max-len
  const userParsed = objectMapper.parse<User>('{"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa","items":[{"id":1,"name":"Game Of Thrones","category":"Book","owner":{"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}},{"id":2,"name":"NVIDIA","category":"Graphic Card","owner":{"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}}]}', {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.email, 'john.alfa@gmail.com');
  t.is(userParsed.firstname, null);
  t.is(userParsed.lastname, 'Alfa');
  t.is(userParsed.items.length, 2);
  t.is(userParsed.items[0].id, 1);
  t.is(userParsed.items[0].name, 'Game Of Thrones');
  t.is(userParsed.items[0].category, 'Book');
  t.is(userParsed.items[0].owner, null);
  t.is(userParsed.items[1].id, 2);
  t.is(userParsed.items[1].name, 'NVIDIA');
  t.is(userParsed.items[1].category, 'Graphic Card');
  t.is(userParsed.items[1].owner, null);
});

test('@JsonIgnoreProperties at parameter level', t => {
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

    constructor(id: number, email: string, firstname: string, lastname: string,
      @JsonIgnoreProperties({value: ['owner']}) @JsonClassType({type: () => [Array, [Item]]}) items: Item[]) {
      this.id = id;
      this.email = email;
      this.firstname = firstname;
      this.lastname = lastname;
      this.items = items;
    }
  }

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

  const item1 = new Item(1, 'Game Of Thrones', 'Book', null);
  const item2 = new Item(2, 'NVIDIA', 'Graphic Card', null);
  const user = new User(1, 'john.alfa@gmail.com', 'John', 'Alfa', [item1, item2]);
  item1.owner = user;
  item2.owner = user;

  const objectMapper = new ObjectMapper();

  // eslint-disable-next-line max-len
  const userParsed = objectMapper.parse<User>('{"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa","items":[{"id":1,"name":"Game Of Thrones","category":"Book","owner":{"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}},{"id":2,"name":"NVIDIA","category":"Graphic Card","owner":{"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}}]}', {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.email, 'john.alfa@gmail.com');
  t.is(userParsed.firstname, 'John');
  t.is(userParsed.lastname, 'Alfa');
  t.is(userParsed.items.length, 2);
  t.is(userParsed.items[0].id, 1);
  t.is(userParsed.items[0].name, 'Game Of Thrones');
  t.is(userParsed.items[0].category, 'Book');
  t.is(userParsed.items[0].owner, null);
  t.is(userParsed.items[1].id, 2);
  t.is(userParsed.items[1].name, 'NVIDIA');
  t.is(userParsed.items[1].category, 'Graphic Card');
  t.is(userParsed.items[1].owner, null);
});

test('@JsonIgnoreProperties at parameter level (inside @JsonClass)', t => {
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

    constructor(id: number, email: string, firstname: string, lastname: string,
      @JsonClassType({type: () => [Array, [
        () => ({
          target: Item,
          decorators: [
            {
              name: 'JsonIgnoreProperties',
              options: {
                value: ['owner']
              }
            }
          ]
        })]]}) items: Item[]) {
      this.id = id;
      this.email = email;
      this.firstname = firstname;
      this.lastname = lastname;
      this.items = items;
    }
  }

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

  const item1 = new Item(1, 'Game Of Thrones', 'Book', null);
  const item2 = new Item(2, 'NVIDIA', 'Graphic Card', null);
  const user = new User(1, 'john.alfa@gmail.com', 'John', 'Alfa', [item1, item2]);
  item1.owner = user;
  item2.owner = user;

  const objectMapper = new ObjectMapper();

  // eslint-disable-next-line max-len
  const userParsed = objectMapper.parse<User>('{"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa","items":[{"id":1,"name":"Game Of Thrones","category":"Book","owner":{"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}},{"id":2,"name":"NVIDIA","category":"Graphic Card","owner":{"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}}]}', {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.email, 'john.alfa@gmail.com');
  t.is(userParsed.firstname, 'John');
  t.is(userParsed.lastname, 'Alfa');
  t.is(userParsed.items.length, 2);
  t.is(userParsed.items[0].id, 1);
  t.is(userParsed.items[0].name, 'Game Of Thrones');
  t.is(userParsed.items[0].category, 'Book');
  t.is(userParsed.items[0].owner, null);
  t.is(userParsed.items[1].id, 2);
  t.is(userParsed.items[1].name, 'NVIDIA');
  t.is(userParsed.items[1].category, 'Graphic Card');
  t.is(userParsed.items[1].owner, null);
});

test('@JsonIgnoreProperties with @JsonGetter and @JsonSetter', t => {
  @JsonIgnoreProperties({value: ['fullname']})
  class User {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    firstname: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    lastname: string;
    @JsonProperty() @JsonClassType({type: () => [Array, [String]]})
    fullname: string[];

    constructor(id: number, firstname: string, lastname: string) {
      this.id = id;
      this.firstname = firstname;
      this.lastname = lastname;
    }

    @JsonGetter({value: 'fullname'}) @JsonClassType({type: () => [String]})
    getFullname(): string {
      return this.firstname + ' ' + this.lastname;
    }

    @JsonSetter({value: 'fullname'})
    setFullname(fullname: string) {
      this.fullname = fullname.split(' ');
    }
  }

  const user = new User(1, 'John', 'Alfa');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"firstname":"John","lastname":"Alfa"}'));

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.firstname, 'John');
  t.is(userParsed.lastname, 'Alfa');
  t.is(userParsed.fullname, undefined);
});

test('@JsonIgnoreProperties with allowGetters "true"', t => {
  @JsonIgnoreProperties({value: ['fullname', 'firstname'], allowGetters: true})
  class User {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    firstname: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    lastname: string;
    @JsonProperty() @JsonClassType({type: () => [Array, [String]]})
    fullname: string[];

    constructor(id: number, firstname: string, lastname: string) {
      this.id = id;
      this.firstname = firstname;
      this.lastname = lastname;
    }

    @JsonGetter({value: 'fullname'}) @JsonClassType({type: () => [String]})
    getFullname(): string {
      return this.firstname + ' ' + this.lastname;
    }

    @JsonSetter({value: 'fullname'})
    setFullname(fullname: string) {
      this.fullname = fullname.split(' ');
    }
  }

  const user = new User(1, 'John', 'Alfa');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"lastname":"Alfa","fullname":"John Alfa"}'));

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.firstname, null);
  t.is(userParsed.lastname, 'Alfa');
  t.is(userParsed.fullname, undefined);
});

test('@JsonIgnoreProperties with allowSetters "true"', t => {
  @JsonIgnoreProperties({value: ['fullname', 'firstname'], allowGetters: true, allowSetters: true})
  class User {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    firstname: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    lastname: string;
    @JsonProperty() @JsonClassType({type: () => [Array, [String]]})
    fullname: string[];

    constructor(id: number, firstname: string, lastname: string) {
      this.id = id;
      this.firstname = firstname;
      this.lastname = lastname;
    }

    @JsonGetter({value: 'fullname'}) @JsonClassType({type: () => [String]})
    getFullname(): string {
      return this.firstname + ' ' + this.lastname;
    }

    @JsonSetter({value: 'fullname'})
    setFullname(fullname: string) {
      this.fullname = fullname.split(' ');
    }
  }

  const user = new User(1, 'John', 'Alfa');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"lastname":"Alfa","fullname":"John Alfa"}'));

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.firstname, null);
  t.is(userParsed.lastname, 'Alfa');
  t.deepEqual(userParsed.fullname, ['John', 'Alfa']);
});

test('@JsonIgnoreProperties with @JsonProperty as getters and setters', t => {
  @JsonIgnoreProperties({value: ['fullname', 'firstname']})
  class User {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    firstname: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    lastname: string;
    @JsonProperty() @JsonClassType({type: () => [Array, [String]]})
    fullname: string[];

    constructor(id: number) {
      this.id = id;
    }

    @JsonProperty() @JsonClassType({type: () => [String]})
    getFullname(): string {
      return this.firstname + ' ' + this.lastname;
    }

    @JsonProperty()
    setFullname(fullname: string) {
      const fullnameSplitted = fullname.split(' ');
      this.firstname = fullnameSplitted[0];
      this.lastname = fullnameSplitted[1];
      this.fullname = fullnameSplitted;
    }
  }

  const user = new User(1);
  user.firstname = 'John';
  user.lastname = 'Alfa';
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"lastname":"Alfa"}'));

  const userParsed = objectMapper.parse<User>(
    '{"id":1,"firstname":"John","lastname":"Alfa","fullname":"John Alfa"}', {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.firstname, undefined);
  t.is(userParsed.lastname, 'Alfa');
  t.is(userParsed.fullname, undefined);
});

test('@JsonIgnoreProperties with allowGetters and @JsonProperty as getters and setters', t => {
  @JsonIgnoreProperties({value: ['fullname', 'firstname'], allowGetters: true})
  class User {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    firstname: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    lastname: string;
    @JsonProperty() @JsonClassType({type: () => [Array, [String]]})
    fullname: string[];

    constructor(id: number) {
      this.id = id;
    }

    @JsonProperty() @JsonClassType({type: () => [String]})
    getFullname(): string {
      return this.firstname + ' ' + this.lastname;
    }

    @JsonProperty()
    setFullname(fullname: string) {
      const fullnameSplitted = fullname.split(' ');
      this.firstname = fullnameSplitted[0];
      this.lastname = fullnameSplitted[1];
      this.fullname = fullnameSplitted;
    }
  }

  const user = new User(1);
  user.firstname = 'John';
  user.lastname = 'Alfa';
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"lastname":"Alfa","fullname":"John Alfa"}'));

  const userParsed = objectMapper.parse<User>(
    '{"id":1,"firstname":"John","lastname":"Alfa","fullname":"John Alfa"}', {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.firstname, undefined);
  t.is(userParsed.lastname, 'Alfa');
  t.is(userParsed.fullname, undefined);
});

test('@JsonIgnoreProperties with allowSetters and @JsonProperty as getters and setters', t => {
  @JsonIgnoreProperties({value: ['fullname', 'firstname'], allowGetters: true, allowSetters: true})
  class User {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    firstname: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    lastname: string;
    @JsonProperty() @JsonClassType({type: () => [Array, [String]]})
    fullname: string[];

    constructor(id: number) {
      this.id = id;
    }

    @JsonProperty() @JsonClassType({type: () => [String]})
    getFullname(): string {
      return this.firstname + ' ' + this.lastname;
    }

    @JsonProperty()
    setFullname(fullname: string) {
      const fullnameSplitted = fullname.split(' ');
      this.firstname = fullnameSplitted[0];
      this.lastname = fullnameSplitted[1];
      this.fullname = fullnameSplitted;
    }
  }

  const user = new User(1);
  user.firstname = 'John';
  user.lastname = 'Alfa';
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"lastname":"Alfa","fullname":"John Alfa"}'));

  const userParsed = objectMapper.parse<User>('{"id":1,"fullname":"John Alfa"}', {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.firstname, 'John');
  t.is(userParsed.lastname, 'Alfa');
  t.deepEqual(userParsed.fullname, ['John', 'Alfa']);
});

test('@JsonIgnoreProperties with ignoreUnknown "true"', t => {
  @JsonIgnoreProperties({value: ['firstname'], ignoreUnknown: true})
  class User {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    firstname: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    lastname: string;

    constructor(id: number, firstname: string, lastname: string) {
      this.id = id;
      this.firstname = firstname;
      this.lastname = lastname;
    }
  }

  const objectMapper = new ObjectMapper();
  const jsonData = '{"id":1,"firstname":"John","lastname":"Alfa","email":"john.alfa@gmail.com"}';

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.firstname, null);
  t.is(userParsed.lastname, 'Alfa');
  t.assert(!Object.hasOwnProperty.call(userParsed, 'email'));
});
