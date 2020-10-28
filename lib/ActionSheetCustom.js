import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
	Text, View, StyleSheet, Dimensions,
	Modal, TouchableHighlight, Animated, ScrollView
} from 'react-native'

import styles, { btnStyle, sheetStyle, hairlineWidth } from './styles'


const TITLE_H         = 40
const MESSAGE_H 		  = 40
const CANCEL_MARGIN  	= 6
const BUTTON_H 				= 50 + hairlineWidth
const WARN_COLOR 			= '#ff3b30'
const MAX_HEIGHT 			= Dimensions.get('window').height * 0.7


class ActionSheet extends Component {
	constructor(props) {
		super(props)
		this.scrollEnabled = false
		this.translateY = this._calculateHeight(props)
		this.state = {
			visible: false,
			sheetAnim: new Animated.Value(this.translateY)
		}
		this._cancel = this._cancel.bind(this)
	}

	componentWillReceiveProps(nextProps) {
		this.translateY = this._calculateHeight(nextProps)
	}

	show() {
		this.setState({visible: true})
		this._showSheet();
	}

	hide(index) {
		this._hideSheet(() => {
			this.setState({visible: false})
			this.props.onPress(index)
		})
	}

	_cancel() {
		const { cancelButtonIndex } = this.props
		// 保持和 ActionSheetIOS 一致，
		// 未设置 cancelButtonIndex 时，点击背景不隐藏 ActionSheet
		if (cancelButtonIndex > -1) {
			this.hide(cancelButtonIndex)
		}
	}

	_showSheet() {
		Animated.timing(this.state.sheetAnim, {
			toValue: 0,
			duration: 250
		}).start()
	}

	_hideSheet(callback) {
		Animated.timing(this.state.sheetAnim, {
			toValue: this.translateY,
			duration: 150
		}).start(callback || function() {})
	}

	_calculateHeight(props) {
		let count = props.options.length
    let buttonHight = props.optionButtonHeight || BUTTON_H;
    let cancelMargin = props.cancelOptionMargin || CANCEL_MARGIN;
    let titleHeight = props.titleHeight || TITLE_H;
		let height = buttonHight * count + cancelMargin
		if (props.title) height += titleHeight
    if (props.message) height += MESSAGE_H
    const maxHeight = props.height ? props.height * 0.7 : MAX_HEIGHT;
		if (height > maxHeight) {
			this.scrollEnabled = true;
			return maxHeight
		} else {
			this.scrollEnabled = false;
			return height
		}
	}

	_renderTitle() {
		const title = this.props.title

		if (!title) {
			return null
		}

		if (React.isValidElement(title)) {
			return (
				<View style={sheetStyle.title}>{title}</View>
			)
		}

		return (
			<View style={sheetStyle.title}>
				<Text style={sheetStyle.titleText}>{title}</Text>
			</View>
		)
	}

	_renderMessage() {
		const message = this.props.message

		if (!message) {
			return null
		}

		if (React.isValidElement(message)) {
			return (
				<View style={sheetStyle.message}>{message}</View>
			)
		}

		return (
			<View style={sheetStyle.message}>
				<Text style={sheetStyle.titleText}>{message}</Text>
			</View>
		)
	}

	_renderCancelButton() {
		let {options, cancelButtonIndex, tintColor,
      cancelOptionButtonStyle, cancelOptionStyle,
    } = this.props
		if (cancelButtonIndex > -1 && options[cancelButtonIndex]) {
			return (
				<TouchableHighlight
					activeOpacity={1}
					underlayColor="#f4f4f4"
					style={[btnStyle.wrapper, {marginTop: 6}, cancelOptionButtonStyle]}
					onPress={this._cancel}
				>
					<Text style={[btnStyle.title,
              {fontWeight: '700', color: tintColor},
              cancelOptionStyle
            ]}>
            {options[cancelButtonIndex]}
          </Text>
				</TouchableHighlight>
			)
		} else {
			return null
		}
	}

	_createButton(title, fontColor, index, optionButtonStyle,
    firstOptionButtonStyle,
    lastOptionButtonStyle,
    optionStyle,
    optionTextProps,
  ) {
		let titleNode = null
		if (React.isValidElement(title)) {
			titleNode = title
		} else {
			titleNode = (
        <Text {...optionTextProps} style={[btnStyle.title, optionStyle, {color: fontColor}]}>
          {title}
        </Text>
      )
		}
		return (
			<TouchableHighlight
				key={index}
				activeOpacity={1}
				underlayColor="#f4f4f4"
				style={[btnStyle.wrapper, optionButtonStyle || {},
          firstOptionButtonStyle, lastOptionButtonStyle
        ]}
				onPress={this.hide.bind(this, index)}
			>
				{titleNode}
			</TouchableHighlight>
		)
	}

	_renderOptions() {
		let {options, tintColor, cancelButtonIndex,
      destructiveButtonIndex, optionButtonStyle,
      firstOptionButtonStyle,
      lastOptionButtonStyle,
      optionStyle,
      optionTextProps,
    } = this.props
    const firstOptionIdx = 0 === cancelButtonIndex ? 1: 0;
    const lastOptionIdx = options.length - 1 === cancelButtonIndex ?
      options.length - 2 :
      options.length - 1;
		return options.map((title, index) => {
  		let fontColor = destructiveButtonIndex === index ? WARN_COLOR : tintColor
			return index === cancelButtonIndex ? null :
        this._createButton(title, fontColor, index,
          optionButtonStyle,
          index === firstOptionIdx ? firstOptionButtonStyle : null,
          index === lastOptionIdx ? lastOptionButtonStyle : null,
          optionStyle,
          optionTextProps,
      )
		})
	}

	render() {
		const { cancelButtonIndex,
      overlayStyle,
      sheetContainerStyle,
      optionsOuterContainerStyle,
      optionsContainerStyle,
    } = this.props
		const { visible, sheetAnim } = this.state
		return (
			<Modal
				visible={visible}
				transparent={true}
				animationType="none"
				onRequestClose={this._cancel}
			>
				<View style={sheetStyle.wrapper}>
					<Text style={[styles.overlay, overlayStyle]} onPress={this._cancel}></Text>
					<Animated.View
						style={[sheetStyle.bd, sheetContainerStyle, {height: this.translateY, transform: [{translateY: sheetAnim}]}]}
					>
						{this._renderTitle()}
						{this._renderMessage()}
            <View style={[{ flex: 1 }, optionsOuterContainerStyle]}>
              <ScrollView
  							scrollEnabled={this.scrollEnabled}
  							contentContainerStyle={[sheetStyle.options, optionsContainerStyle]}>
  							{this._renderOptions()}
  						</ScrollView>
            </View>
						{this._renderCancelButton()}
					</Animated.View>
				</View>
			</Modal>
		)
	}
}


ActionSheet.propTypes = {
	title: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.element
	]),
  message: PropTypes.string,
	options: PropTypes.arrayOf((propVal, key, componentName, location, propFullName) => {
		if (typeof propVal[key] !== 'string' && !React.isValidElement(propVal[key])) {
			return new Error(
        'Invalid prop `' + propFullName + '` supplied to' +
        ' `' + componentName + '`. Validation failed.'
      )
		}
	}),
	tintColor: PropTypes.string,
	cancelButtonIndex: PropTypes.number,
	destructiveButtonIndex: PropTypes.number,
	onPress: PropTypes.func,
  overlayStyle: PropTypes.any,
  sheetContainerStyle: PropTypes.any,
  optionsOuterContainerStyle: PropTypes.any,
  optionsContainerStyle: PropTypes.any,
  optionButtonStyle: PropTypes.any,
  optionStyle: PropTypes.any,
  cancelOptionButtonStyle: PropTypes.any,
  cancelOptionStyle: PropTypes.any,
  optionButtonHeight: PropTypes.number,
  cancelOptionMargin: PropTypes.number,
  titleHeight: PropTypes.number,
  optionTextProps: PropTypes.any,
}


ActionSheet.defaultProps = {
	tintColor: '#007aff',
	onPress: () => {}
}


export default ActionSheet
