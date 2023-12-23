import { Item } from "../../scripts/items/types/Item";
import { getBase } from "../../scripts/items/getBase";
import { ItemQuality } from "../../scripts/items/types/ItemQuality";

function ItemOptions({ item }: { item: Item }) {
  if (!item) return null;
  const base = getBase(item);
  const type = base //&& Data.itemTypes[base.type];
  //if (!type) return null;

  return (
    <ul class="d2p-ItemOptions">
      <li>{item.name}</li>
      <li>{base?.name}</li>
      <li>Item Level: {item.level}</li>
      {item.quality !== ItemQuality.UNIQUE && item.quality !== ItemQuality.SET &&
        !item.runeword
        //item.quality !== ItemQuality.RUNEWORD
        //&& item.quality !== ItemQuality.CRAFTED
        //&& (!type.magic || type.rare)
        && (
          <li>
            {`Quality:`}{' '}
            <select value={item.quality} //onChange={setQuality} disabled={isPreset}
            >
              {<option value={ItemQuality.LOW}>{`Low`}</option>}
              {<option value={ItemQuality.NORMAL}>{`Normal`}</option>}
              {<option value={ItemQuality.SUPERIOR}>{`Superior`}</option>}
              {<option value={ItemQuality.MAGIC}>{`Magic`}</option>}
              {<option value={ItemQuality.RARE}>{`Rare`}</option>}
              {/*!!canCraft && <option value={Quality.CRAFTED}>{_L`Crafted`}</option>*/}
            </select>
          </li>
        )}
      {"def" in base && (
        <li>
          Defense:{" "}
          <span class={item.enhancedDefense ? "magic" : ""}>
            {item.defense}
          </span>
        </li>
      )}
      {item.durability && (
        <li>
          Durability: {item.durability?.[0]} of{" "}
          {item.durability[1] + (item.extraDurability ?? 0)}
        </li>
      )}
    </ul>
  );
}

// const ItemRunewordSection = props => (
//   <GenericUniqueSection {...props}>
//     <h3 className={`d2-color-${Color.GOLD}`}>{_L`Runeword`}</h3>
//   </GenericUniqueSection>
// );

export default function ItemEditor({ item }: { item: Item }) {
  if (!item) return null;

  const magicMods = item.modifiers?.map(
      ({ description, range }) =>
        description && (
          <div class="magic">
            {description}
            {/* <Range range={range} /> */}
          </div>
        )
  ) ?? [];
  
  if (item.ethereal || item.sockets) {
    const toDisplay = [
      item.ethereal && "Ethereal",
      item.sockets && `Socketed (${item.sockets})`,
    ].filter((m) => !!m);
    magicMods?.push(
      <div class="magic">
        {toDisplay.join(", ")}
        {/* <Range range={item.socketsRange} /> */}
      </div>
    );
  }

  const setItemMods = item.setItemModifiers?.flatMap((mods) =>
    mods.map(
      ({ description, range }) =>
        description && (
          <div class="set">
            {description}
            {/* <Range range={range} /> */}
          </div>
        )
    )
  );

  const setGlobalMods = item.setGlobalModifiers?.flatMap((mods) =>
    mods.map(
      ({ description }) =>
        description && <div class="unique">{description}</div>
    )
  );
  setGlobalMods?.unshift(<br />);

  return <>
    <div className="d2p-ItemEditor">
      <div className="d2p-header">
        <ItemOptions item={item} />
      </div>
      {/* {!!(item.quality === ItemQuality.UNIQUE) && <ItemUniqueSection item={item}/>}
      {!!(item.quality === ItemQuality.SET) && <ItemSetSection item={item}/>}
      {!!(item.runeword) && <ItemRunewordSection item={item}/>} */}
      {magicMods}
      {setItemMods}
      {setGlobalMods}
    </div>
  </>;
}