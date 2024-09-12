
import PropTypes from 'prop-types'

const CustomTooltip = ({children, text}) => {
  return (
    <div className="relative inline-block text-left">
      <div className="group">
        <span className="text-blue-600">{children}</span>
        <div className="absolute left-1/2 bottom-full mb-2 w-max max-w-xs -translate-x-1/2 px-3 py-2 bg-green-800 text-white text-[12px] font-normal font-poppins rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {text}
          <div className="absolute left-1/2 bottom-0 w-3 h-3 bg-green-800 transform -translate-x-1/2 rotate-45 -mb-1" />
        </div>
      </div>
    </div>
  )
}

CustomTooltip.propTypes = {
  children: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
}

export default CustomTooltip
