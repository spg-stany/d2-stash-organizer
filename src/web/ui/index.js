import { useContext, useEffect, useMemo, useState, useImperativeHandle } from "preact/hooks";
import { forwardRef, useRef } from 'preact/compat';
import PropTypes from 'prop-types';
//import classNames from 'classnames';
//import Align from 'ui/utils/Align';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faTimes, faChevronDown } from '@fortawesome/free-solid-svg-icons'

import './Select.scss';

import SelectMenu from './SelectMenu';

const optionName = opt => typeof opt === "object" ? opt.name : opt;

export const underlinerFunc = (value, regex) => {
  let found = false;
  return value.split(regex).map((str, index) => {
    if (!found && str.match(regex)) {
      found = true;
      return <em key={index}>{str}</em>;
    } else {
      return str;
    }
  });
};

const defaultCallbacks = {
  renderOption: (opt, search) => <span>{search ? underlinerFunc(optionName(opt), search) : optionName(opt)}</span>,
  renderValue: opt => <span>{optionName(opt)}</span>,
  renderHeader: name => <span>{name}</span>,
  renderArrow: disabled => <FontAwesomeIcon icon={disabled ? faLock : faChevronDown} className={"ui-Select-arrow"} />,
  searchFunc: (opt, search) => optionName(opt).match(search),
  placeholder: "Select option...",
  noResultsText: term => term ? `No results match "${term}"` : "No results",
  isDisabled: opt => (typeof opt === "object" ? !!opt.disabled : false),
};

const Select = useMemo(forwardRef(function Select(props, ref) {
  const {
    options,
    width,
    renderOption = defaultCallbacks.renderOption,
    renderValue = defaultCallbacks.renderValue,
    isDisabled = defaultCallbacks.isDisabled,
    renderHeader = defaultCallbacks.renderHeader,
    renderArrow = defaultCallbacks.renderArrow,
    placeholder = defaultCallbacks.placeholder,
    menuBefore,
    value,
    onChange,
    className,
    menuClass,
    portalTo,
    searchLimit = -1,
    searchMiddle = false,
    searchFunc = defaultCallbacks.searchFunc,
    tabIndex = "-1",
    maxHeight = 300,
    noResultsText = defaultCallbacks.noResultsText,
    virtualScroll = false,
    allowEmpty = false,
    disabled = false,
    onOpen: onOpenProp,
    onClose: onCloseProp,
    children,
    ...otherProps
  } = props;

  const [isOpen, setOpen] = useState(null);
  const onToggle = useCallback(() => {
    if (isOpen || disabled) {
      if (isOpen && onCloseProp) onCloseProp();
      setOpen(null);
    } else {
      if (!isOpen && onOpenProp) onOpenProp();
      setOpen("ui-drop-bottom ui-drop-test");
    }
  }, [isOpen, disabled, onCloseProp, onOpenProp]);
  const onClose = useCallback(() => {
    setOpen(null);
    if (onCloseProp) onCloseProp();
  }, [onCloseProp]);
  const valueRef = useRef();

  const menuRef = useRef();
  useEffect(() => {
    if (isOpen && isOpen.includes("ui-drop-test") && menuRef.current) {
      let overflowParent = portalTo ? portalTo : valueRef.current.parentNode;
      let parentStyle = window.getComputedStyle(overflowParent);
      while (overflowParent !== document.documentElement && parentStyle.overflow === "visible") {
        overflowParent = overflowParent.parentElement;
        parentStyle = window.getComputedStyle(overflowParent);
      }
      const parentBox = overflowParent.getBoundingClientRect();
      const parentTop = parentBox.top + (parseFloat(parentStyle.paddingTop) || 0) + (parseFloat(parentStyle.borderTopWidth) || 0);
      const parentBottom = parentBox.bottom - (parseFloat(parentStyle.paddingBottom) || 0) - (parseFloat(parentStyle.borderBottomWidth) || 0);
      const valueBox = valueRef.current.getBoundingClientRect();
      const height = menuRef.current.offsetHeight;
      if (valueBox.bottom + height > parentBottom && valueBox.bottom - height - parentBottom > parentTop - valueBox.top - height) {
        setOpen("ui-drop-top");
      } else {
        setOpen("ui-drop-bottom");
      }
    }
  }, [portalTo, isOpen]);

  useImperativeHandle(ref, () => ({
    focus() {
      if (!isOpen) {
        onToggle();
      }
    }
  }), [isOpen, onToggle]);

  const onSetValue = useCallback(value => {
    setOpen(false);
    onChange(value);
    valueRef.current.focus();
    if (onCloseProp) onCloseProp();
  }, [onChange, onCloseProp]);

  const onClear = useCallback(e => {
    onSetValue(null);
    e.stopPropagation();
  }, [onSetValue]);

  const onKeyDown = useCallback(e => {
    if (disabled) return;
    switch (e.key) {
      case "Enter":
        onToggle();
        break;
      case "Del":
      case "Delete":
        if (allowEmpty && value != null) {
          onSetValue(null);
        }
        break;
      // no default
    }
  }, [onToggle, onSetValue, allowEmpty, value, disabled]);

  let menu = null;
  if (isOpen) {
    menu = <SelectMenu
      options={options}
      className={menuClass}
      menuBefore={menuBefore}
      renderOption={renderOption}
      isDisabled={isDisabled}
      renderHeader={renderHeader}
      value={value}
      setValue={onSetValue}
      searchLimit={searchLimit}
      searchMiddle={searchMiddle}
      searchFunc={searchFunc}
      onClose={onClose}
      valueDiv={valueRef}
      align={isOpen}
      maxHeight={maxHeight}
      virtualScroll={virtualScroll}
      noResultsText={noResultsText}
      menuRef={menuRef}
    />;
    // if (portalTo) {
    //   menu = ReactDOM.createPortal((
    //     <Align method={isOpen === "ui-drop-bottom" ?
    //       {from: "tl", to: "bl", matchWidth: true} :
    //       {from: "bl", to: "tl", matchWidth: true}
    //     } to={valueRef} padding={[-1, 0]}>
    //       {menu}
    //     </Align>
    //   ), portalTo);
    // }
  }

  return (
    <div className={classNames("ui-Select", className, isOpen)} style={{ width }} {...otherProps}>
      <div className={classNames("ui-Select-value", { "ui-select-empty": value == null, "ui-has-clear": allowEmpty && value != null, "ui-select-disabled": disabled })}
        ref={valueRef} onClick={onToggle} onKeyDown={onKeyDown} tabIndex={disabled ? null : tabIndex}>
        {value != null ? renderValue(value) : placeholder}
        {renderArrow(disabled)}
        {!!(allowEmpty && value != null && !disabled) && <FontAwesomeIcon icon={faTimes} className={"ui-Select-clear"} onClick={onClear} />}
      </div>
      {children}
      {menu}
    </div>
  );
}));

Select.propTypes = {
  options: PropTypes.oneOfType([PropTypes.array, PropTypes.func]).isRequired,
  width: PropTypes.number,
  renderOption: PropTypes.func,
  renderValue: PropTypes.func,
  renderHeader: PropTypes.func,
  renderArrow: PropTypes.func,
  placeholder: PropTypes.node,
  menuBefore: PropTypes.node,
  value: PropTypes.any,
  onChange: PropTypes.func,
  className: PropTypes.string,
  menuClass: PropTypes.string,
  portalTo: PropTypes.instanceOf(Element),
  searchMiddle: PropTypes.bool,
  searchLimit: PropTypes.number,
  searchFunc: PropTypes.func,
  tabIndex: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  maxHeight: PropTypes.number,
  noResultsText: PropTypes.func,
  virtualScroll: PropTypes.bool,
  allowEmpty: PropTypes.bool,
  disabled: PropTypes.bool,
};

Select.defaultCallbacks = defaultCallbacks;

export default Select;
