import React from 'react';

export default function BasicCard(props) {
  // Determine card type and styling based on props
  const getCardStyle = () => {
    if (props.about === 'followers') {
      return {
        background: 'gradient-primary',
        textColor: 'text-white',
        iconColor: 'text-white/80',
        icon: '👥'
      };
    } else if (props.about === 'Engagement') {
      return {
        background: 'gradient-secondary',
        textColor: 'text-white',
        iconColor: 'text-white/80',
        icon: '📊',
        cursor:'cursor-pointer',
      };
    } else if (props.about === 'Immersion') {
      return {
        background: 'gradient-tertiary',
        textColor: 'text-white',
        iconColor: 'text-white/80',
        icon: '🧠',
        cursor:'cursor-pointer',
      };
    } else {
      return {
        background: 'bg-gradient-to-br from-slate-100 to-blue-50',
        textColor: 'text-gray-800',
        iconColor: 'text-gray-700',
        icon: '📈'
      };
    }
  };

  const cardStyle = getCardStyle();

  return (
    <div 
      onClick={props.onClick}
      className={`
        min-w-[280px] max-w-[320px] h-full
        ${props.name ? 'mr-[15%]' : ''}
        rounded-2xl shadow-lg overflow-hidden relative
        flex flex-col cursor-${props.onClick ? 'pointer' : 'default'}
        card-hover
      `}
    >
      <div className={`
        ${cardStyle.background} ${cardStyle.cursor} p-6 relative overflow-hidden h-full
        flex flex-col justify-between
      `}>
        {/* Background pattern */}
        <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full bg-white/10 opacity-30" />
        
        {/* Top section with icon and label */}
        <div className="flex justify-between items-start mb-6">
          <div className={`text-4xl ${cardStyle.iconColor}`}>
            {cardStyle.icon}
          </div>
          {props.about && (
            <span className={`
              ${cardStyle.textColor === 'text-white' ? 'text-white/80' : 'text-gray-700'}
              font-semibold uppercase tracking-wider text-xs
            `}>
              {props.about}
            </span>
          )}
        </div>

        {/* Middle section with title and description */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Title */}
          <h3 className={`
            mb-4 font-bold ${cardStyle.textColor} text-4xl leading-tight
          `}>
            {props.title} {props.name}
          </h3>
          
          {/* Description */}
          <p className={`
            ${cardStyle.textColor === 'text-white' ? 'text-white/90' : 'text-gray-800'}
            text-sm leading-relaxed mb-6
          `}>
            {props.description}
          </p>
        </div>

        {/* Bottom section with trend indicator */}
        {props.about && (
          <div className={`
            flex items-center mt-auto pt-4
            ${cardStyle.textColor === 'text-white' ? 'text-white/80' : 'text-gray-700'}
          `}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-xs font-medium">
              +12% from last month
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
