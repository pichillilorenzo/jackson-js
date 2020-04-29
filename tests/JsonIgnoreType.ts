import test from 'ava';
import {JsonIgnoreType} from '../src/decorators/JsonIgnoreType';
import {JsonClassType} from '../src/decorators/JsonClassType';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';

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

test('@JsonIgnoreType serialize', t => {
  const user = new User(1, 'john.alfa@gmail.com', 'John', 'Alfa');
  const item1 = new Item(1, 'Game Of Thrones', 'Book', user);
  const item2 = new Item(2, 'NVIDIA', 'Graphic Card', user);
  user.items.push(...[item1, item2]);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"items":[null,null],"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}'));
});

test('@JsonIgnoreType deserialize', t => {
  // eslint-disable-next-line max-len
  const jsonData = '{"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa","items":[{"id":1,"name":"Game Of Thrones","category":"Book"},{"id":2,"name":"NVIDIA","category":"Graphic Card"}]}';
  const objectMapper = new ObjectMapper();

  const user = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(user instanceof User);
  t.is(user.id, 1);
  t.is(user.email, 'john.alfa@gmail.com');
  t.is(user.firstname, 'John');
  t.is(user.lastname, 'Alfa');
  t.deepEqual(user.items, [null, null]);
});

