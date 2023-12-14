'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var dnd = require('@react-aria/dnd');
var focus = require('@react-aria/focus');
var i18n = require('@react-aria/i18n');
var utils = require('@react-aria/utils');
var visuallyHidden = require('@react-aria/visually-hidden');
var React = require('react');
var style = require('@keystar/ui/style');
var utils$1 = require('@keystar/ui/utils');
var ts = require('@keystar/ui/utils/ts');
var index = require('../slots/dist/keystar-ui-slots.cjs.js');
var jsxRuntime = require('react/jsx-runtime');

var localizedMessages = {
	"ar-AE": {
		dropzoneLabel: "DropZone"
	},
	"bg-BG": {
		dropzoneLabel: "DropZone"
	},
	"cs-CZ": {
		dropzoneLabel: "Místo pro přetažení"
	},
	"da-DK": {
		dropzoneLabel: "DropZone"
	},
	"de-DE": {
		dropzoneLabel: "Ablegebereich"
	},
	"el-GR": {
		dropzoneLabel: "DropZone"
	},
	"en-US": {
		dropzoneLabel: "DropZone"
	},
	"es-ES": {
		dropzoneLabel: "DropZone"
	},
	"et-EE": {
		dropzoneLabel: "DropZone"
	},
	"fi-FI": {
		dropzoneLabel: "DropZone"
	},
	"fr-FR": {
		dropzoneLabel: "DropZone"
	},
	"he-IL": {
		dropzoneLabel: "DropZone"
	},
	"hr-HR": {
		dropzoneLabel: "Zona spuštanja"
	},
	"hu-HU": {
		dropzoneLabel: "DropZone"
	},
	"it-IT": {
		dropzoneLabel: "Zona di rilascio"
	},
	"ja-JP": {
		dropzoneLabel: "ドロップゾーン"
	},
	"ko-KR": {
		dropzoneLabel: "드롭 영역"
	},
	"lt-LT": {
		dropzoneLabel: "„DropZone“"
	},
	"lv-LV": {
		dropzoneLabel: "DropZone"
	},
	"nb-NO": {
		dropzoneLabel: "Droppsone"
	},
	"nl-NL": {
		dropzoneLabel: "DropZone"
	},
	"pl-PL": {
		dropzoneLabel: "Strefa upuszczania"
	},
	"pt-BR": {
		dropzoneLabel: "DropZone"
	},
	"pt-PT": {
		dropzoneLabel: "DropZone"
	},
	"ro-RO": {
		dropzoneLabel: "Zonă de plasare"
	},
	"ru-RU": {
		dropzoneLabel: "DropZone"
	},
	"sk-SK": {
		dropzoneLabel: "DropZone"
	},
	"sl-SI": {
		dropzoneLabel: "DropZone"
	},
	"sr-SP": {
		dropzoneLabel: "DropZone"
	},
	"sv-SE": {
		dropzoneLabel: "DropZone"
	},
	"tr-TR": {
		dropzoneLabel: "DropZone"
	},
	"uk-UA": {
		dropzoneLabel: "DropZone"
	},
	"zh-CN": {
		dropzoneLabel: "放置区域"
	},
	"zh-TW": {
		dropzoneLabel: "放置區"
	}
};

const dropZoneClassList = new style.ClassList('DropZone');

/**
 * A DropZone is an area into which one or multiple objects can be dragged and
 * dropped.
 */
const DropZone = ts.forwardRefWithAs(function DropZone(props, forwardedRef) {
  let dropzoneRef = utils.useObjectRef(forwardedRef);
  let buttonRef = React.useRef(null);
  let {
    dropProps,
    dropButtonProps,
    isDropTarget
  } = dnd.useDrop({
    ...props,
    ref: buttonRef,
    hasDropButton: true
  });
  let {
    clipboardProps
  } = dnd.useClipboard({
    onPaste: items => {
      var _props$onDrop;
      return (_props$onDrop = props.onDrop) === null || _props$onDrop === void 0 ? void 0 : _props$onDrop.call(props, {
        type: 'drop',
        items,
        x: 0,
        y: 0,
        dropOperation: 'copy'
      });
    }
  });
  let {
    focusProps,
    isFocused,
    isFocusVisible
  } = focus.useFocusRing();
  let stringFormatter = i18n.useLocalizedStringFormatter(localizedMessages);
  let labelId = utils.useSlotId();
  let dropzoneId = utils.useSlotId();
  let ariaLabel = props['aria-label'] || stringFormatter.format('dropzoneLabel');
  let messageId = props['aria-labelledby'];
  // Chrome + VO will not announce the drop zone's accessible name if useLabels combines an aria-label and aria-labelledby
  let ariaLabelledby = [dropzoneId, labelId, messageId].filter(Boolean).join(' ');
  let labelProps = utils.useLabels({
    'aria-labelledby': ariaLabelledby
  });

  // Use the "label" slot so consumers can choose whether to put it on a
  // `Heading` or `Text` instance.
  // TODO: warn when no label is provided
  let slots = {
    icon: {
      color: isDropTarget ? 'accent' : 'neutral'
    },
    label: {
      id: labelId,
      color: isDropTarget ? 'accent' : undefined
    }
  };
  let children = utils$1.useRenderProps(props, {
    isDropTarget
  });
  let styleProps = style.useStyleProps(props);
  let ElementType = props.elementType || 'div';
  return /*#__PURE__*/jsxRuntime.jsxs(ElementType, {
    ...dropProps,
    ...styleProps,
    ...utils.filterDOMProps(props, {
      labelable: true
    }),
    ...style.toDataAttributes({
      isDropTarget,
      isFocused,
      isFocusVisible
    }, {
      omitFalsyValues: true,
      trimBooleanKeys: true
    }),
    ref: dropzoneRef,
    className: style.classNames(dropZoneClassList.element('root'), style.css({
      border: `${style.tokenSchema.size.border.medium} dashed ${style.tokenSchema.color.border.neutral}`,
      borderRadius: style.tokenSchema.size.radius.regular,
      display: 'flex',
      flexDirection: 'column',
      gap: style.tokenSchema.size.space.medium,
      '&[data-drop-target]': {
        backgroundColor: style.tokenSchema.color.alias.backgroundSelected,
        borderColor: style.tokenSchema.color.alias.focusRing,
        borderStyle: 'solid',
        cursor: 'copy'
      },
      '&[data-focus-visible]': {
        borderColor: style.tokenSchema.color.alias.focusRing
      }
    }), styleProps.className),
    children: [/*#__PURE__*/jsxRuntime.jsxs(visuallyHidden.VisuallyHidden, {
      children: [/*#__PURE__*/jsxRuntime.jsx("div", {
        id: dropzoneId,
        "aria-hidden": "true",
        children: ariaLabel
      }), /*#__PURE__*/jsxRuntime.jsx("button", {
        ...utils.mergeProps(dropButtonProps, focusProps, clipboardProps, labelProps),
        ref: buttonRef
      })]
    }), /*#__PURE__*/jsxRuntime.jsx(index.SlotProvider, {
      slots: slots,
      children: children
    })]
  });
});

exports.DropZone = DropZone;
exports.dropZoneClassList = dropZoneClassList;
